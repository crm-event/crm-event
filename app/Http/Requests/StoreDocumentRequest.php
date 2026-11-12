<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates a document shared by Jessica with a couple.
 */
class StoreDocumentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'couple_id' => ['required', 'integer', 'exists:couples,id'],
            // Design versions are sent from the Design tab of the wedding file.
            'category' => ['required', 'string', 'max:50', 'not_in:design'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
            'requires_approval' => ['boolean'],
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg', 'max:20480'],
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
            'couple_id.required' => 'Sélectionnez un couple.',
            'category.not_in' => 'Les versions de design s’envoient depuis l’onglet Design de la fiche mariage.',
            'title.required' => 'Donnez un titre au document.',
            'file.required' => 'Sélectionnez un fichier.',
            'file.mimes' => 'Le fichier doit être un PDF, un document, un tableur ou une image.',
            'file.max' => 'Le fichier ne peut pas dépasser 20 Mo.',
        ];
    }
}
