<?php

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

    'gestion_url' => rtrim(env('FRONTEND_GESTION_URL', 'http://localhost:5173'), '/'),

    'client_url' => rtrim(env('FRONTEND_CLIENT_URL', 'http://localhost:5174'), '/'),

];
