<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    /**
     * Props partagées avec toutes les pages.
     *
     * Les deux guards sont exposés séparément : une page du back-office lit
     * `auth.manager`, une page du portail lit `auth.couple`. Aucune des deux
     * ne peut voir l'utilisateur de l'autre espace.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'manager' => $request->user('manager'),
                'couple' => $request->user('couple'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
