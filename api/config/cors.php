<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS
    |--------------------------------------------------------------------------
    |
    | Seules les deux SPAs déclarées dans le .env peuvent appeler l'API avec
    | des cookies (supports_credentials). Pas de wildcard : un wildcard est
    | incompatible avec les cookies et ouvrirait l'API à n'importe quel site.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_GESTION_URL'),
        env('FRONTEND_CLIENT_URL'),
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
