<?php

namespace App\Http\Requests\Couple;

use App\Models\MediaItem;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Validates an inspiration photo or a moodboard added by a couple.
 */
class StoreMediaItemRequest extends FormRequest
{
    /** Number of inspiration photos a wedding can hold. */
    public const MAX_INSPIRATIONS = 30;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'collection' => ['required', Rule::in([MediaItem::INSPIRATIONS, MediaItem::MOODBOARDS])],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:25600'],
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
            'file.required' => 'Choisissez une image.',
            'file.mimes' => 'L’image doit être au format JPG, PNG ou WebP.',
            'file.max' => 'L’image ne peut pas dépasser 25 Mo.',
            'file.uploaded' => 'L’image n’a pas pu être envoyée : elle est peut-être trop lourde.',
        ];
    }

    /**
     * Refuse a new inspiration photo once the gallery is full.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $wedding = $this->user()->couple?->latestWedding;

                if (
                    $this->input('collection') === MediaItem::INSPIRATIONS
                    && $wedding?->mediaItems()->where('collection', MediaItem::INSPIRATIONS)->count() >= self::MAX_INSPIRATIONS
                ) {
                    $validator->errors()->add('file', 'Vous avez atteint '.self::MAX_INSPIRATIONS.' photos : retirez-en une avant d’en ajouter.');
                }
            },
        ];
    }
}
