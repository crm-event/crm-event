<?php

namespace App\Http\Requests\Couple;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the creative brief of a couple.
 */
class UpdateDesignBriefRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'palette' => ['array', 'max:12'],
            'palette.*' => ['string', 'max:50'],
            'avoid' => ['nullable', 'string', 'max:2000'],
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
            'title.max' => 'L’intention doit tenir en 255 caractères.',
            'description.max' => 'La description ne peut pas dépasser 5 000 caractères.',
            'palette.max' => 'Indiquez 12 couleurs au plus.',
            'palette.*.max' => 'Chaque couleur doit tenir en 50 caractères.',
            'avoid.max' => 'Ce texte ne peut pas dépasser 2 000 caractères.',
        ];
    }

    /**
     * The palette is typed as "Ivoire, lin, vert sauge": turn it into a list.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'palette' => collect(explode(',', (string) $this->input('palette_input')))
                ->map(fn (string $colour): string => trim($colour))
                ->filter()
                ->values()
                ->all(),
        ]);
    }
}
