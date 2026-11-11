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
     * Get validation messages in the language of the couple.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.max' => __('forms.design_brief.title_max'),
            'description.max' => __('forms.design_brief.description_max'),
            'palette.max' => __('forms.design_brief.palette_max'),
            'palette.*.max' => __('forms.design_brief.palette_item_max'),
            'avoid.max' => __('forms.design_brief.avoid_max'),
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
