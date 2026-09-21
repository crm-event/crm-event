<?php

use App\Http\Controllers\Api\V1\Gestion\Auth\MeController;
use App\Http\Controllers\Api\V1\Gestion\Auth\NewPasswordController;
use App\Http\Controllers\Api\V1\Gestion\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\V1\Gestion\Auth\SessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Back-office (Groupe 1) — préfixe /api/v1/gestion, noms gestion.*
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

    Route::middleware('auth:coordinator')->group(function () {
        Route::get('me', MeController::class)->name('me');
        Route::post('logout', [SessionController::class, 'destroy'])->name('logout');
    });
});

// Toutes les routes métier du back-office vivent ici, derrière le guard
// "coordinator". Un client authentifié sur le portail reçoit 401 ici.
Route::middleware('auth:coordinator')->group(function () {
    //
});
