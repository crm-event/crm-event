<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteAmendmentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'wedding_service_id' => ['required', 'integer', 'exists:wedding_services,id'],
            'description' => ['required', 'string', 'max:2000'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['wedding_service_id' => 'prestation', 'description' => 'description', 'amount' => 'montant'];
    }
}
