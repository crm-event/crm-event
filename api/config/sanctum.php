<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Domaines "stateful"
    |--------------------------------------------------------------------------
    |
    | Origines (host:port) des deux SPAs autorisées à s'authentifier par
    | cookie de session. Toute requête venant d'ailleurs est traitée comme
    | anonyme, même si elle transporte un cookie valide.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost:5173,localhost:5174,127.0.0.1:5173,127.0.0.1:5174',
        Sanctum::currentApplicationUrlWithPort(),
    ))),

    // Guards testés par auth:sanctum. Le projet utilise directement
    // auth:coordinator / auth:client pour rester explicite.
    'guard' => ['coordinator', 'client'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],

];
