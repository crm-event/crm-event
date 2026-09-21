<?php

use App\Models\Client;
use App\Models\Coordinator;

return [

    /*
    |--------------------------------------------------------------------------
    | Deux populations, deux guards, deux tables
    |--------------------------------------------------------------------------
    |
    | - "coordinator" : la coordinatrice (back-office /api/v1/gestion/*)
    | - "client"      : ses clients (portail /api/v1/client/*)
    |
    | Une session authentifiée sur un guard ne donne AUCUN accès aux routes
    | protégées par l'autre guard : la séparation est structurelle, pas une
    | simple vérification de rôle.
    |
    */

    'defaults' => [
        'guard' => 'coordinator',
        'passwords' => 'coordinators',
    ],

    'guards' => [
        'coordinator' => [
            'driver' => 'session',
            'provider' => 'coordinators',
        ],

        'client' => [
            'driver' => 'session',
            'provider' => 'clients',
        ],
    ],

    'providers' => [
        'coordinators' => [
            'driver' => 'eloquent',
            'model' => Coordinator::class,
        ],

        'clients' => [
            'driver' => 'eloquent',
            'model' => Client::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation de mot de passe
    |--------------------------------------------------------------------------
    |
    | Tables séparées : un même email peut exister chez une coordinatrice et
    | chez un client sans que les jetons se télescopent. Le lien de reset
    | envoyé pointe vers le bon front (voir AppServiceProvider).
    |
    */

    'passwords' => [
        'coordinators' => [
            'provider' => 'coordinators',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],

        'clients' => [
            'provider' => 'clients',
            'table' => 'client_password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
