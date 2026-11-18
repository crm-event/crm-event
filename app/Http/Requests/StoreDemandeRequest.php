<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDemandeRequest extends FormRequest
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
            'partner1_first_name' => ['required', 'string', 'max:100'],
            'partner1_last_name' => ['nullable', 'string', 'max:100'],
            'partner2_first_name' => ['nullable', 'string', 'max:100'],
            'partner2_last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:50'],
            'origine' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'lieu' => ['nullable', 'string', 'max:160'],
            'budget' => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'prestations' => ['present', 'array', 'max:50'],
            'prestations.*' => ['integer', 'distinct', Rule::exists('services', 'id')->where('is_active', true)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
