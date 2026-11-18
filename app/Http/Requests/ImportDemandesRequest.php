<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportDemandesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(UserRole::Admin) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'demandes' => ['required', 'array', 'max:100'],
            'demandes.*' => ['array:id,nom,date,lieu,budget,prestations,statut,notes,motifPerte,email,telephone,origine'],
            'demandes.*.id' => ['required', 'string', 'max:100', 'regex:/^demande-[a-zA-Z0-9-]+$/', 'distinct'],
            'demandes.*.nom' => ['required', 'string', 'max:120'],
            'demandes.*.date' => ['nullable', 'date_format:Y-m-d'],
            'demandes.*.lieu' => ['nullable', 'string', 'max:160'],
            'demandes.*.budget' => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'demandes.*.prestations' => ['present', 'array', 'max:50'],
            'demandes.*.prestations.*' => ['string', 'max:50'],
            'demandes.*.statut' => ['required', 'in:nouveau,qualifie,devis,relance,signe,perdu'],
            'demandes.*.notes' => ['present', 'array', 'max:100'],
            'demandes.*.notes.*' => ['string', 'max:1000'],
            'demandes.*.motifPerte' => ['nullable', 'string', 'max:255'],
            'demandes.*.email' => ['nullable', 'email', 'max:255'],
            'demandes.*.telephone' => ['nullable', 'string', 'max:50'],
            'demandes.*.origine' => ['nullable', 'string', 'max:255'],
        ];
    }
}
