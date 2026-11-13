<?php

namespace App\Http\Requests\Couple;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the review a couple leaves after their wedding: a rating out of
 * five, whether they would recommend La Dernière Touche and, if they wish, a
 * few words.
 */
class StoreReviewRequest extends FormRequest
{
    /**
     * Maximum length of the text of a review, in characters.
     */
    public const MAX_BODY_LENGTH = 3000;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'would_recommend' => ['required', 'boolean'],
            'body' => ['nullable', 'string', 'max:'.self::MAX_BODY_LENGTH],
        ];
    }

    /**
     * Get the error messages shown to the couple, in their language.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rating.required' => __('forms.review.rating_required'),
            'rating.integer' => __('forms.review.rating_required'),
            'rating.between' => __('forms.review.rating_required'),
            'would_recommend.required' => __('forms.review.recommend_required'),
            'would_recommend.boolean' => __('forms.review.recommend_required'),
            'body.max' => __('forms.review.body_max', ['max' => self::MAX_BODY_LENGTH]),
        ];
    }

    /**
     * Remove surrounding spaces so that a text made of blanks is left empty.
     */
    protected function prepareForValidation(): void
    {
        $body = trim((string) $this->input('body'));

        $this->merge([
            'body' => $body === '' ? null : $body,
        ]);
    }
}
