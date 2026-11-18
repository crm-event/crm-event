<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordAmendmentSignatureRequest;
use App\Http\Requests\StoreQuoteAmendmentRequest;
use App\Models\Payment;
use App\Models\QuoteAmendment;
use App\Models\Wedding;
use App\Models\WeddingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PrestationsDevisController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate(['wedding_id' => ['nullable', 'integer', 'exists:weddings,id']]);
        $wedding = isset($validated['wedding_id'])
            ? Wedding::query()->with(['couple', 'venue', 'weddingServices.service', 'weddingServices.payments', 'weddingServices.amendments'])->findOrFail($validated['wedding_id'])
            : null;

        return Inertia::render('Mariage/PrestationsDevis', [
            'mariages' => Wedding::query()->with('couple')->orderByDesc('wedding_date')->get()->map(fn (Wedding $item): array => [
                'id' => $item->id,
                'nom' => $item->couple->threadTitle(),
                'date' => $item->wedding_date?->toDateString(),
            ]),
            'mariage' => $wedding ? [
                'id' => $wedding->id,
                'nom' => $wedding->couple->threadTitle(),
                'date' => $wedding->wedding_date?->toDateString(),
                'lieu' => $wedding->venue?->name,
                'convives' => $wedding->guest_count,
            ] : null,
            'prestations' => $wedding?->weddingServices->map(fn (WeddingService $sold): array => [
                'id' => $sold->id,
                'nom' => $sold->service->name,
                'montant' => $sold->amount,
                'devis_numero' => $sold->quote_number,
                'devis_envoye' => $sold->quote_sent_at?->toDateString(),
                'devis_valide_jusquau' => $sold->quote_valid_until?->toDateString(),
                'devis_accepte' => $sold->quote_accepted_at?->toDateString(),
                'contrat_signe' => $sold->contract_signed_at?->toDateString(),
                'paiements' => $sold->payments->map(fn (Payment $payment): array => [
                    'id' => $payment->id,
                    'type' => $payment->type,
                    'montant' => $payment->amount,
                    'echeance' => $payment->due_date?->toDateString(),
                    'paye' => $payment->paid_at?->toDateString(),
                ]),
                'avenants' => $sold->amendments->map(fn (QuoteAmendment $amendment): array => [
                    'id' => $amendment->id,
                    'description' => $amendment->description,
                    'montant' => $amendment->amount,
                    'signe' => $amendment->signed_at?->toDateString(),
                ]),
            ]) ?? [],
        ]);
    }

    public function storeAmendment(StoreQuoteAmendmentRequest $request): RedirectResponse
    {
        $amendment = QuoteAmendment::query()->create($request->validated());

        return to_route('mariages.prestations', ['wedding_id' => $amendment->weddingService->wedding_id]);
    }

    public function recordSignature(RecordAmendmentSignatureRequest $request, QuoteAmendment $amendment): RedirectResponse
    {
        $weddingId = DB::transaction(function () use ($request, $amendment): int {
            $locked = QuoteAmendment::query()->whereKey($amendment->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->signed_at !== null, 409, 'La signature de cet avenant est déjà enregistrée.');
            if ((float) $locked->amount <= 0) {
                throw ValidationException::withMessages(['signed_at' => 'Le montant de l’avenant doit être positif pour créer un paiement.']);
            }
            $locked->update(['signed_at' => $request->validated('signed_at')]);
            $locked->weddingService->payments()->create([
                'type' => 'amendment',
                'amount' => $locked->amount,
                'due_date' => $request->validated('due_date'),
            ]);

            return $locked->weddingService->wedding_id;
        });

        return to_route('mariages.prestations', ['wedding_id' => $weddingId]);
    }
}
