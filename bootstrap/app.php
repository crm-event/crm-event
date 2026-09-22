<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Application web classique : Inertia branche le partage de props et
        // la négociation des redirections sur le groupe "web".
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Il n'y a pas de route "login" unique : chaque espace a la sienne.
        // On choisit donc la destination d'après l'URL demandée, sans quoi
        // le middleware auth échoue sur une route introuvable.
        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('gestion', 'gestion/*')
                ? route('gestion.login')
                : route('portail.login'),
        );

        // Symétrique : un utilisateur déjà connecté qui revient sur un écran
        // « invité » est renvoyé vers l'accueil de SON espace.
        $middleware->redirectUsersTo(
            fn (Request $request) => $request->is('gestion', 'gestion/*')
                ? route('gestion.dashboard')
                : route('portail.home'),
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
