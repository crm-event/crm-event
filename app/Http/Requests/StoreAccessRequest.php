<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Validates a request for a client space, sent from the public site in French
 * or in English.
 */
class StoreAccessRequest extends FormRequest
{
    private const MAX_REQUESTS = 5;

    private const RATE_LIMIT_SECONDS = 600;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'partner1_first_name' => ['required', 'string', 'max:255'],
            'partner2_first_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'wedding_date' => ['nullable', 'date', 'after:today'],
            'language' => ['nullable', 'in:fr,en'],
            'website' => ['nullable'],
        ];
    }

    /**
     * Get validation messages in the language of the visitor.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->isInEnglish()
            ? [
                'partner1_first_name.required' => 'Please enter your first name.',
                'email.required' => 'Please enter your email address.',
                'email.email' => 'This email address is not valid.',
                'wedding_date.date' => 'This date is not valid.',
                'wedding_date.after' => 'The wedding date must be in the future.',
            ]
            : [
                'partner1_first_name.required' => 'Indiquez votre prénom.',
                'email.required' => 'Indiquez votre adresse e-mail.',
                'email.email' => 'Cette adresse e-mail n’est pas valide.',
                'wedding_date.date' => 'Cette date n’est pas valide.',
                'wedding_date.after' => 'La date du mariage doit être à venir.',
            ];
    }

    /**
     * Count this request and refuse it if too many came from this visitor: the
     * form is public and each request reaches Jessica's list.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        $key = 'access-request|'.$this->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_REQUESTS)) {
            throw ValidationException::withMessages([
                'email' => $this->isInEnglish()
                    ? 'Too many requests. Please try again in a few minutes.'
                    : 'Trop de demandes. Réessayez dans quelques minutes.',
            ]);
        }

        RateLimiter::hit($key, self::RATE_LIMIT_SECONDS);
    }

    /**
     * The e-mail will be the login: keep a single spelling of it.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['email' => mb_strtolower(trim((string) $this->input('email')))]);
    }

    /**
     * Determine whether the visitor is reading the site in English.
     */
    private function isInEnglish(): bool
    {
        return $this->input('language') === 'en';
    }
}
