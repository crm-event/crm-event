<?php

namespace App\Http\Controllers\Api\V1\Client\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class PasswordResetLinkController extends Controller
{
    /**
     * Envoi du lien de réinitialisation / d'activation (client).
     */
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        Password::broker('clients')->sendResetLink($request->only('email'));

        // Réponse identique que l'email existe ou non : on ne révèle pas
        // quelles adresses ont un compte.
        return response()->json(['message' => __('passwords.sent')]);
    }
}
