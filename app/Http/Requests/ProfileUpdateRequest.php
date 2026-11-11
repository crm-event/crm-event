<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    /**
     * Get validation messages in the language of the user.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => __('forms.profile.name_required'),
            'email.required' => __('forms.profile.email_required'),
            'email.email' => __('forms.profile.email_invalid'),
            'email.unique' => __('forms.profile.email_taken'),
        ];
    }

    /**
     * The e-mail is the login: keep a single spelling of it.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['email' => mb_strtolower(trim((string) $this->input('email')))]);
    }
}
