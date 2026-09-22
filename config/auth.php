<?php

use App\Models\Couple;
use App\Models\Manager;

return [

    /*
    |--------------------------------------------------------------------------
    | Deux populations, deux guards
    |--------------------------------------------------------------------------
    |
    | - "manager" : le back-office de la coordinatrice
    | - "couple"  : le portail des mariés
    |
    | Les deux s'authentifient par session web classique. Les identifiants
    | vivent dans la table `user` ; chaque provider la restreint à sa
    | population via la sous-classe correspondante (cf. App\Models\Manager et
    | App\Models\Couple). Une session ouverte sur un guard ne donne AUCUN
    | accès aux routes protégées par l'autre : la séparation est
    | structurelle, pas une simple vérification de rôle.
    |
    */

    'defaults' => [
        'guard' => 'manager',
        'passwords' => 'managers',
    ],

    'guards' => [
        'manager' => [
            'driver' => 'session',
            'provider' => 'managers',
        ],

        'couple' => [
            'driver' => 'session',
            'provider' => 'couples',
        ],
    ],

    'providers' => [
        'managers' => [
            'driver' => 'eloquent',
            'model' => Manager::class,
        ],

        'couples' => [
            'driver' => 'eloquent',
            'model' => Couple::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation de mot de passe
    |--------------------------------------------------------------------------
    |
    | Les deux populations partagent la table `password_reset_tokens` : un
    | e-mail identifie un seul compte dans `user`, il ne peut donc pas y avoir
    | de collision entre un manager et un couple.
    |
    */

    'passwords' => [
        'managers' => [
            'provider' => 'managers',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],

        'couples' => [
            'provider' => 'couples',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
