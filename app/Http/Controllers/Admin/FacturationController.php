<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttachPaymentInvoiceRequest;
use App\Http\Requests\FacturationRequest;
use App\Models\Setting;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FacturationController extends Controller
{
    public function __invoke(): Response
    {
        $payments = $this->serviceQuery()
            ->join('payments', 'payments.wedding_service_id', '=', 'wedding_services.id')
            ->orderByDesc('payments.id')
            ->get([
                'payments.id',
                'payments.type',
                'payments.amount',
                'payments.due_date',
                'payments.invoice_number',
                'payments.invoice_url',
                'payments.invoiced_at',
                'payments.paid_at',
                'payments.created_at',
                'weddings.id as wedding_id',
                'couples.partner1_first_name',
                'couples.partner2_first_name',
                'services.name as service_name',
                'venues.name as venue_name',
            ])
            ->map(function (object $payment): object {
                $url = $payment->invoice_url;
                if ($url && (! filter_var($url, FILTER_VALIDATE_URL) || ! in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true))) {
                    $payment->invoice_url = null;
                }

                return $payment;
            });

        $services = $this->serviceQuery()
            ->orderBy('couples.partner1_first_name')
            ->get([
                'wedding_services.id',
                'weddings.id as wedding_id',
                'couples.partner1_first_name',
                'couples.partner2_first_name',
                'services.name as service_name',
            ]);

        return Inertia::render('Facturation', [
            'payments' => $payments,
            'services' => $services,
            'today' => now()->toDateString(),
            'seuils' => Setting::query()->whereIn('key', ['vat_threshold', 'vat_threshold_immediate'])
                ->orderBy('valid_from')->get(['key', 'value', 'valid_from'])
                ->filter(fn (Setting $setting): bool => is_numeric($setting->value) && (float) $setting->value > 0)
                ->map(fn (Setting $setting): array => [
                    'cle' => $setting->key,
                    'valeur' => $setting->value,
                    'date' => substr($setting->valid_from, 0, 10),
                ])->values(),
        ]);
    }

    public function store(FacturationRequest $request): RedirectResponse
    {
        DB::table('payments')->insert([
            ...$request->validated(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return to_route('facturation.index');
    }

    public function update(FacturationRequest $request, int $payment): RedirectResponse
    {
        abort_unless(DB::table('payments')->where('id', $payment)->exists(), 404);

        DB::table('payments')->where('id', $payment)->update([
            ...$request->validated(),
            'updated_at' => now(),
        ]);

        return to_route('facturation.index');
    }

    public function attachInvoice(AttachPaymentInvoiceRequest $request, int $payment): RedirectResponse
    {
        DB::transaction(function () use ($request, $payment): void {
            $existing = DB::table('payments')->where('id', $payment)->lockForUpdate()->first();
            abort_if($existing === null, 404);

            if ($existing->invoice_number !== null && trim($existing->invoice_number) !== '') {
                throw ValidationException::withMessages(['invoice_number' => 'Une facture est déjà renseignée pour ce paiement.']);
            }

            $data = $request->validated();
            if (($data['invoice_url'] ?? null) === null) {
                unset($data['invoice_url']);
            }

            DB::table('payments')->where('id', $payment)->update([
                ...$data,
                'updated_at' => now(),
            ]);
        });

        return to_route('facturation.index');
    }

    private function serviceQuery(): Builder
    {
        return DB::table('wedding_services')
            ->join('weddings', 'weddings.id', '=', 'wedding_services.wedding_id')
            ->join('couples', 'couples.id', '=', 'weddings.couple_id')
            ->join('services', 'services.id', '=', 'wedding_services.service_id')
            ->leftJoin('venues', 'venues.id', '=', 'weddings.venue_id');
    }
}
