<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Replaces the temporary password given by Jessica at the first login.
 */
class FirstPasswordController extends Controller
{
    /**
     * Display the page where the user chooses their password.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->must_change_password) {
            return redirect($request->user()->homeUrl());
        }

        return Inertia::render('Auth/FirstPassword');
    }

    /**
     * Save the chosen password.
     *
     * Only for a temporary password: any other change of password must go
     * through the profile page, which asks for the current one.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->must_change_password) {
            return redirect($user->homeUrl());
        }

        $validated = $request->validate([
            'password' => [
                'required',
                Password::defaults(),
                'confirmed',
                function (string $attribute, mixed $value, Closure $fail) use ($user): void {
                    if (Hash::check($value, $user->password)) {
                        $fail(__('forms.password.same_as_temporary'));
                    }
                },
            ],
        ], [
            'password.required' => __('forms.password.required'),
            'password.min' => __('forms.password.min'),
            'password.confirmed' => __('forms.password.confirmed'),
        ]);

        // must_change_password is not mass assignable: a request must never set it.
        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ])->save();

        return redirect($user->homeUrl());
    }
}
