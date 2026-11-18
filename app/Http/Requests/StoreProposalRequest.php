<?php

namespace App\Http\Requests;

use App\Models\Proposal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates a design version sent by Jessica from the Design tab of the
 * wedding file: a poster or a page exported from Canva, or a PDF.
 */
class StoreProposalRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(array_keys(Proposal::TYPES))],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file' => ['required', 'file', 'mimes:pdf,png,jpg,jpeg,webp', 'max:20480'],
        ];
    }

    /**
     * Get the validation messages (the back office is in French).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Choisissez le type de proposition.',
            'type.in' => 'Ce type de proposition n’existe pas.',
            'title.required' => 'Donnez un titre à cette version.',
            'title.max' => 'Le titre doit tenir en 255 caractères.',
            'description.max' => 'Le message ne peut pas dépasser 2 000 caractères.',
            'file.required' => 'Ajoutez le fichier de la version.',
            'file.mimes' => 'Le fichier doit être une image (JPG, PNG, WebP) ou un PDF.',
            'file.max' => 'Le fichier ne peut pas dépasser 20 Mo.',
            'file.uploaded' => 'Le fichier n’a pas pu être envoyé : il est peut-être trop lourd.',
        ];
    }
}
