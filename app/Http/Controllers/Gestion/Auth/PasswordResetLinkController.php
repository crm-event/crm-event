<?php

namespace App\Http\Controllers\Gestion\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Gestion/Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(ForgotPasswordRequest $request): RedirectResponse
    {
        Password::broker('managers')->sendResetLink($request->only('email'));

        // Réponse identique que l'adresse existe ou non : on ne révèle pas
        // quelles adresses ont un compte.
        return back()->with('status', __('passwords.sent'));
    }
}
