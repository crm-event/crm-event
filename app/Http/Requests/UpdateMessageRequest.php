<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates an edited text message.
 */
class UpdateMessageRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:'.StoreMessageRequest::MAX_BODY_LENGTH],
        ];
    }

    /**
     * Get the validation messages in French.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'Votre message est vide.',
            'body.max' => 'Votre message ne peut pas dépasser '.StoreMessageRequest::MAX_BODY_LENGTH.' caractères.',
        ];
    }

    /**
     * Remove surrounding spaces before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'body' => trim((string) $this->input('body')),
        ]);
    }
}
