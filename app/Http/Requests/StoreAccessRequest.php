<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Validates a request for a client space, sent from the public site. The
 * messages follow the language of the visitor (see SetLocale).
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
        return [
            'partner1_first_name.required' => __('forms.access_request.first_name_required'),
            'email.required' => __('forms.access_request.email_required'),
            'email.email' => __('forms.access_request.email_invalid'),
            'wedding_date.date' => __('forms.access_request.wedding_date_invalid'),
            'wedding_date.after' => __('forms.access_request.wedding_date_past'),
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
                'email' => __('forms.access_request.too_many_requests'),
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
}
