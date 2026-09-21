<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
|
| /api/v1/gestion/*  → back-office de la coordinatrice (Groupe 1), guard "coordinator"
| /api/v1/client/*   → portail client (Groupe 2), guard "client"
|
| Chaque équipe ne modifie que son fichier dans routes/api/. Ce fichier-ci
| ne change pas.
|
*/

Route::prefix('v1')->group(function () {
    Route::prefix('gestion')->name('gestion.')->group(base_path('routes/api/gestion.php'));
    Route::prefix('client')->name('client.')->group(base_path('routes/api/client.php'));
});
