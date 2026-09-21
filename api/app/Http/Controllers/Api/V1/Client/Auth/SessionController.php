<?php

namespace App\Http\Controllers\Api\V1\Client\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Resources\ClientResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Session d'un client du portail (guard "client").
 */
class SessionController extends Controller
{
    /**
     * Connexion au portail client.
     */
    public function store(LoginRequest $request): ClientResource
    {
        $request->authenticate('client');

        $request->session()->regenerate();

        return new ClientResource($request->user('client'));
    }

    /**
     * Déconnexion du portail client.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('client')->logout();

        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
