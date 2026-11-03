<?php

namespace App\Http\Requests\Couple;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates a new message or reply in the community space.
 */
class StoreCommunityPostRequest extends FormRequest
{
    /**
     * Maximum length of a message, in characters.
     */
    public const MAX_BODY_LENGTH = 2000;

    /**
     * Get the validation rules that apply to the request.
     *
     * A reply can only target a top-level message: replies go one level deep.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:'.self::MAX_BODY_LENGTH],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('community_posts', 'id')->whereNull('parent_id'),
            ],
        ];
    }

    /**
     * Get the error messages shown to the couple, in French.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'Votre message est vide.',
            'body.max' => 'Votre message ne peut pas dépasser '.self::MAX_BODY_LENGTH.' caractères.',
            'parent_id.exists' => 'Le message auquel vous répondez n’existe plus.',
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
