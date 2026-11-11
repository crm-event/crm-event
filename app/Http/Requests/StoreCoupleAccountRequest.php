<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the space opened by Jessica for a couple.
 */
class StoreCoupleAccountRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'partner1_first_name' => ['required', 'string', 'max:255'],
            'partner1_last_name' => ['nullable', 'string', 'max:255'],
            'partner2_first_name' => ['nullable', 'string', 'max:255'],
            'partner2_last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'wedding_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Get validation messages in French.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'partner1_first_name.required' => 'Indiquez au moins un prénom.',
            'email.required' => 'Indiquez l’adresse e-mail du couple.',
            'email.email' => 'Cette adresse e-mail n’est pas valide.',
            'email.unique' => 'Un compte existe déjà avec cette adresse e-mail.',
            'wedding_date.date' => 'Cette date n’est pas valide.',
        ];
    }

    /**
     * The e-mail is the login: keep a single spelling of it.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['email' => mb_strtolower(trim((string) $this->input('email')))]);
    }
}
