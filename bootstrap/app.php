<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        /*
         * Pages d'erreur maison, dans la charte du projet : un couple ne doit
         * jamais voir le « 404 | Not Found » brut de Laravel.
         *
         * 404 et 403 ne sont pas des bugs mais des situations normales : on les
         * rend toujours. 500 et 503 en revanche ne sont remplacés qu'en dehors
         * du poste de développement, pour garder la page de debug de Laravel
         * quand on travaille.
         */
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($request->expectsJson()) {
                return $response;
            }

            $statut = $response->getStatusCode();

            $aRemplacer = in_array($statut, [403, 404], true)
                || (in_array($statut, [500, 503], true) && ! app()->environment('local', 'testing'));

            if (! $aRemplacer) {
                return $response;
            }

            return Inertia::render('Error', ['status' => $statut])
                ->toResponse($request)
                ->setStatusCode($statut);
        });
    })->create();
