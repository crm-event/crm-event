<?php

use App\Http\Controllers\Api\V1\Client\Auth\MeController;
use App\Http\Controllers\Api\V1\Client\Auth\NewPasswordController;
use App\Http\Controllers\Api\V1\Client\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\V1\Client\Auth\SessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Portail client (Groupe 2) — préfixe /api/v1/client, noms client.*
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('login', [SessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:password-reset')
        ->name('password.email');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:password-reset')
        ->name('password.store');

    Route::middleware('auth:client')->group(function () {
        Route::get('me', MeController::class)->name('me');
        Route::post('logout', [SessionController::class, 'destroy'])->name('logout');
    });
});

// Toutes les routes métier du portail vivent ici, derrière le guard
// "client". Une coordinatrice authentifiée sur le back-office reçoit 401 ici.
Route::middleware('auth:client')->group(function () {
    //
});
