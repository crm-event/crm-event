<?php

namespace App\Http\Controllers\Api\V1\Client\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Models\Client;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class NewPasswordController extends Controller
{
    /**
     * Définition d'un nouveau mot de passe (client). Sert aussi à
     * l'activation initiale du compte portail.
     */
    public function store(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker('clients')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Client $client) use ($request) {
                $client->forceFill([
                    'password' => $request->string('password'),
                    'activated_at' => $client->activated_at ?? now(),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($client));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['message' => __($status)]);
    }
}
