<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Point d'entrée local
|--------------------------------------------------------------------------
|
| Confort de développement, et rien d'autre : en local, la racine de l'API
| renvoie vers le front sur lequel on travaille, au lieu de répondre 404.
| Le front visé vient de FRONTEND_LOCAL_ENTRY (cf. config/frontend.php),
| réglé dans le .env de chacun.
|
| Hors environnement local, ou sans FRONTEND_LOCAL_ENTRY, ce fichier
| n'enregistre aucune route : l'API se comporte exactement comme avant.
| En production, le front est servi par le serveur web, pas par l'API.
|
| Les routes d'API (préfixe /api) et le health check /up sont déclarés
| avant celles-ci : ils ne sont jamais concernés par le fallback.
|
*/

$frontend = config('frontend.local_entry');

if (! app()->isLocal() || $frontend === null) {
    return;
}

Route::get('/', fn () => redirect($frontend));

// Toute autre URL est rejouée à l'identique sur le front, qui affiche alors
// sa propre page « introuvable » plutôt que le 404 brut de Laravel.
Route::fallback(fn (Request $request) => redirect($frontend.$request->getRequestUri()));
