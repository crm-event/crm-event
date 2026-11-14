<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavePaymentRequest;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\WeddingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FacturationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Facturation', [
            'encaissements' => Payment::query()->with(['weddingService.service', 'weddingService.wedding.couple', 'weddingService.wedding.venue'])
                ->orderByDesc('id')->get()->map(function (Payment $payment): array {
                    $sold = $payment->weddingService;
                    $wedding = $sold->wedding;
                    $url = $payment->invoice_url;
                    $safeUrl = $url && filter_var($url, FILTER_VALIDATE_URL) && in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true) ? $url : null;

                    return [
                        'id' => $payment->id,
                        'wedding_service_id' => $sold->id,
                        'couple' => $wedding->couple->threadTitle(),
                        'dossier' => $wedding->id,
                        'lieu' => $wedding->venue?->name,
                        'prestation' => $sold->service->name,
                        'type' => $payment->type,
                        'montant' => $payment->amount,
                        'echeance' => $payment->due_date?->toDateString(),
                        'paiement' => $payment->paid_at?->toDateString(),
                        'facture_numero' => $payment->invoice_number,
                        'facture_url' => $url,
                        'facture_lien' => $safeUrl,
                        'facture_date' => $payment->invoiced_at?->toDateString(),
                    ];
                }),
            'prestations' => WeddingService::query()->with(['wedding.couple', 'service'])->orderBy('id')->get()->map(fn (WeddingService $sold): array => [
                'id' => $sold->id,
                'libelle' => $sold->wedding->couple->threadTitle().' — '.$sold->service->name.' (dossier '.$sold->wedding_id.')',
            ]),
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

    public function store(SavePaymentRequest $request): RedirectResponse
    {
        Payment::query()->create($request->validated());

        return to_route('facturation.index');
    }

    public function update(SavePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $payment->update($request->validated());

        return to_route('facturation.index');
    }
}
