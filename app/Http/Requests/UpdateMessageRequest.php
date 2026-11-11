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
     * Get the validation messages in the language of the sender.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => __('forms.message.body_required'),
            'body.max' => __('forms.message.body_max', ['max' => StoreMessageRequest::MAX_BODY_LENGTH]),
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
