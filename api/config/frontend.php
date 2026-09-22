<?php

$gestionUrl = rtrim(env('FRONTEND_GESTION_URL', 'http://localhost:5173'), '/');
$clientUrl = rtrim(env('FRONTEND_CLIENT_URL', 'http://localhost:5174'), '/');

return [

    /*
    |--------------------------------------------------------------------------
    | URLs des deux SPAs
    |--------------------------------------------------------------------------
    |
    | Utilisées pour construire les liens envoyés par mail (reset / activation)
    | et, via le .env, pour la liste blanche CORS et les domaines stateful
    | de Sanctum. Les ports sont fixés dans chaque vite.config.ts.
    |
    */

    'gestion_url' => $gestionUrl,

    'client_url' => $clientUrl,

    /*
    |--------------------------------------------------------------------------
    | Front servi depuis la racine de l'API, en local
    |--------------------------------------------------------------------------
    |
    | L'API n'a pas d'interface : sa racine répondait 404, ce qui déroute quand
    | on ouvre le lien affiché par `artisan serve`. Renseigner
    | FRONTEND_LOCAL_ENTRY dans son .env (fichier local, jamais versionné) fait
    | pointer cette racine vers le front sur lequel on travaille :
    |
    |     FRONTEND_LOCAL_ENTRY=client    → portail client   (:5174)
    |     FRONTEND_LOCAL_ENTRY=gestion   → back-office      (:5173)
    |
    | Chaque équipe règle le sien sans gêner l'autre. Vide : rien ne change.
    | Voir routes/web.php.
    |
    */

    'local_entry' => match (env('FRONTEND_LOCAL_ENTRY')) {
        'client' => $clientUrl,
        'gestion' => $gestionUrl,
        default => null,
    },

];
