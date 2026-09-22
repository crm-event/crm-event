<?php

namespace App\Http\Controllers\Portail\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Session du portail des mariés (guard "couple").
 */
class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Portail/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate('couple');

        $request->session()->regenerate();

        return redirect()->intended(route('portail.home'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('couple')->logout();

        // On fait tourner l'identifiant de session (anti-fixation) sans
        // invalider l'autre guard éventuellement ouvert dans le même
        // navigateur (utile en dev quand on teste les deux espaces).
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return redirect()->route('portail.login');
    }
}
