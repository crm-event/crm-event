<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FacturationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->getRawOriginal('role') === 'admin';
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentDateRules = ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'];

        if ($this->isMethod('patch')) {
            return ['paid_at' => ['present', ...$paymentDateRules]];
        }

        return [
            'wedding_service_id' => ['required', 'integer', 'exists:wedding_services,id'],
            'type' => ['required', 'in:deposit,balance,amendment'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:99999999.99'],
            'due_date' => ['required', 'date_format:Y-m-d'],
            'invoice_number' => ['required', 'string', 'max:255', 'unique:payments,invoice_number'],
            'invoice_url' => ['nullable', 'url:http,https', 'max:2048'],
            'invoiced_at' => ['required', 'date_format:Y-m-d'],
            'paid_at' => $paymentDateRules,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'wedding_service_id' => 'prestation du dossier',
            'type' => 'type de paiement',
            'amount' => 'montant',
            'due_date' => 'date d’échéance',
            'invoice_number' => 'numéro de facture',
            'invoice_url' => 'lien de la facture',
            'invoiced_at' => 'date de facturation',
            'paid_at' => 'date de paiement',
        ];
    }
}
