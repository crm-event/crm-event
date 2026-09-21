<?php

namespace App\Http\Controllers\Api\V1\Gestion\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class PasswordResetLinkController extends Controller
{
    /**
     * Envoi du lien de réinitialisation (coordinatrice).
     */
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        Password::broker('coordinators')->sendResetLink($request->only('email'));

        // Réponse identique que l'email existe ou non : on ne révèle pas
        // quelles adresses ont un compte.
        return response()->json(['message' => __('passwords.sent')]);
    }
}
