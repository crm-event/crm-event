<?php

namespace App\Http\Controllers\Api\V1\Gestion\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Models\Coordinator;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class NewPasswordController extends Controller
{
    /**
     * Définition d'un nouveau mot de passe (coordinatrice).
     */
    public function store(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker('coordinators')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Coordinator $coordinator) use ($request) {
                $coordinator->forceFill([
                    'password' => $request->string('password'),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($coordinator));
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
