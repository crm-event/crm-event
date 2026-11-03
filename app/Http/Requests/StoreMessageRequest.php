<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates a private message, sent by a couple or by Jessica.
 */
class StoreMessageRequest extends FormRequest
{
    /**
     * Maximum length of a message, in characters.
     */
    public const MAX_BODY_LENGTH = 5000;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:'.self::MAX_BODY_LENGTH],
        ];
    }

    /**
     * Get the error messages, in French.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'Votre message est vide.',
            'body.max' => 'Votre message ne peut pas dépasser '.self::MAX_BODY_LENGTH.' caractères.',
        ];
    }

    /**
     * Remove surrounding spaces so that a message made of blanks is empty.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'body' => trim((string) $this->input('body')),
        ]);
    }
}
