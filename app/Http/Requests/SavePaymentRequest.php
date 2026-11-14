<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePaymentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'wedding_service_id' => ['required', 'integer', 'exists:wedding_services,id', ...($this->route('payment') ? [Rule::in([$this->route('payment')->wedding_service_id])] : [])],
            'type' => ['required', Rule::in(['deposit', 'balance', 'amendment'])],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'invoice_number' => ['nullable', 'string', 'max:255', Rule::unique('payments', 'invoice_number')->ignore($this->route('payment'))],
            'invoice_url' => ['nullable', 'url:http,https', 'max:2048'],
            'invoiced_at' => ['nullable', 'date_format:Y-m-d'],
            'paid_at' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['wedding_service_id' => 'prestation', 'type' => 'type', 'amount' => 'montant', 'due_date' => 'échéance', 'invoice_number' => 'numéro de facture', 'invoice_url' => 'lien de facture', 'invoiced_at' => 'date de facture', 'paid_at' => 'date de paiement'];
    }
}
