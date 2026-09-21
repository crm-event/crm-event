<?php

namespace App\Http\Controllers\Api\V1\Gestion\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Resources\CoordinatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Session de la coordinatrice (guard "coordinator").
 */
class SessionController extends Controller
{
    /**
     * Connexion au back-office.
     */
    public function store(LoginRequest $request): CoordinatorResource
    {
        $request->authenticate('coordinator');

        $request->session()->regenerate();

        return new CoordinatorResource($request->user('coordinator'));
    }

    /**
     * Déconnexion du back-office.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('coordinator')->logout();

        // On fait tourner l'identifiant de session (anti-fixation) sans
        // invalider les autres guards éventuellement ouverts dans le même
        // navigateur (utile en dev quand on teste les deux fronts).
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
