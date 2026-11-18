<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AttachPaymentInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole(UserRole::Admin) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invoice_number' => ['required', 'string', 'max:255', 'unique:payments,invoice_number'],
            'invoiced_at' => ['required', 'date_format:Y-m-d'],
            'invoice_url' => ['nullable', 'url:http,https', 'max:2048'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['invoice_number' => 'numéro de facture', 'invoiced_at' => 'date de facturation', 'invoice_url' => 'lien de la facture'];
    }
}
