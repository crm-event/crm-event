<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Venue;
use App\Models\Wedding;
use App\Models\WeddingService;
use App\Support\WeddingDesign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WeddingSelectionController extends Controller
{
    /**
     * Display all weddings ordered by wedding date.
     */
    public function index(): Response
    {
        $weddings = Wedding::with('couple')
            ->orderBy('wedding_date', 'asc')
            ->get();

        return Inertia::render('Wedding/WeddingSelection', [
            'weddings' => $weddings,
        ]);
    }

    /**
     * Display a specific wedding and its related information.
     */
    public function show(int $id): Response
    {
        $wedding = Wedding::with([
            'couple',
            'venue',
            'weddingServices.service',
            'vendors.category',
            'timelineItems',
            'documents',
        ])->where('id', $id)->firstOrFail();

        if (! $wedding) {
            abort(404);
        }

        return Inertia::render('Wedding/Wedding', [
            'wedding' => $wedding,
            'prestations' => $wedding->weddingServices,
            'prestataires' => $wedding->vendors,
            'milestones' => $wedding->timelineItems,
            'documents' => $wedding->documents,
            'design' => WeddingDesign::forAdmin($wedding),
        ]);
    }

    /**
     * Display the wedding edit form.
     */
    public function edit(int $id): Response
    {
        $wedding = Wedding::with([
            'couple',
            'venue',
            'weddingServices.service',
        ])->where('id', $id)->firstOrFail();

        if (! $wedding) {
            abort(404);
        }

        return Inertia::render('Wedding/Edit', [
            'wedding' => $wedding,

            'venues' => Venue::query()
                ->orderBy('name')
                ->get(['id', 'name']),

            'services' => Service::query()
                ->orderBy('name')
                ->get(['id', 'name']),

            'selectedServiceIds' => $wedding->weddingServices
                ->pluck('service_id')
                ->map(fn ($id) => (int) $id)
                ->values(),

            'selectedServices' => $wedding->weddingServices
                ->map(fn ($service) => [
                    'service_id' => (int) $service->service_id,
                    'amount' => $service->amount,
                    'locked' => $service->quote_accepted_at !== null || $service->contract_signed_at !== null,
                ])
                ->values(),
        ]);
    }

    /**
     * Validate and save the updated wedding information.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $wedding = Wedding::with('couple')->findOrFail($id);

        // Validate all submitted data.
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'wedding_date' => ['required', 'date'],
            'venue_id' => ['nullable', 'integer', Rule::exists('venues', 'id')],
            'guest_count' => ['required', 'integer', 'min:0'],
            'service_ids' => ['present', 'array'],
            'service_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('services', 'id'),
            ],
            'service_amounts' => ['present', 'array'],
            'service_amounts.*' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
        ]);

        // Ensure that each selected service has exactly one amount.
        $selectedServiceIds = array_map(
            'strval',
            $validated['service_ids']
        );

        $amountServiceIds = array_map(
            'strval',
            array_keys($validated['service_amounts'])
        );

        sort($selectedServiceIds);
        sort($amountServiceIds);

        if ($selectedServiceIds !== $amountServiceIds) {
            throw ValidationException::withMessages([
                'service_amounts' => 'Chaque prestation sélectionnée doit avoir un montant valide.',
            ]);
        }

        DB::transaction(function () use ($wedding, $validated, $selectedServiceIds) {
            $lockedServices = $wedding->weddingServices()->lockForUpdate()->get()
                ->filter(fn (WeddingService $sold): bool => $sold->quote_accepted_at !== null || $sold->contract_signed_at !== null);

            $lockedByService = $lockedServices->keyBy('service_id');

            foreach ($selectedServiceIds as $serviceId) {
                if (! $lockedByService->has($serviceId) && $validated['service_amounts'][$serviceId] === null) {
                    throw ValidationException::withMessages([
                        'service_amounts.'.$serviceId => 'Le montant de cette prestation est obligatoire.',
                    ]);
                }
            }

            foreach ($lockedServices as $sold) {
                if (! in_array((string) $sold->service_id, $selectedServiceIds, true)) {
                    throw ValidationException::withMessages([
                        'service_ids' => 'Une prestation dont le devis est accepté ou le contrat signé ne peut pas être retirée.',
                    ]);
                }

                $submittedAmount = $validated['service_amounts'][$sold->service_id];
                $amountChanged = $sold->amount === null
                    ? $submittedAmount !== null
                    : $submittedAmount === null || round((float) $sold->amount * 100) !== round((float) $submittedAmount * 100);
                if ($amountChanged) {
                    throw ValidationException::withMessages([
                        'service_amounts.'.$sold->service_id => 'Le montant d’un devis accepté ou d’un contrat signé ne peut pas être modifié. Utilisez un avenant.',
                    ]);
                }
            }

            // Update wedding information.
            $wedding->update([
                'wedding_date' => $validated['wedding_date'],
                'venue_id' => $validated['venue_id'],
                'guest_count' => $validated['guest_count'],
            ]);

            // Update couple email.
            $wedding->couple->update([
                'email' => $validated['email'],
            ]);

            // Permanently delete services that are no longer selected.
            $wedding->weddingServices()
                ->whereNotIn('service_id', $validated['service_ids'])
                ->delete();

            // Create or update selected services.
            foreach ($validated['service_ids'] as $serviceId) {
                if ($lockedByService->has($serviceId)) {
                    continue;
                }

                $wedding->weddingServices()->updateOrCreate(
                    ['service_id' => $serviceId],
                    [
                        'amount' => $validated['service_amounts'][$serviceId],
                    ]
                );
            }
        });

        return redirect()
            ->route('admin.wedding.show', $wedding->id)
            ->with('success', 'Le dossier du mariage a bien été mis à jour.');
    }
}
