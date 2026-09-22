<?php

use App\Http\Controllers\Gestion\Auth\AuthenticatedSessionController as GestionSession;
use App\Http\Controllers\Gestion\Auth\NewPasswordController as GestionNewPassword;
use App\Http\Controllers\Gestion\Auth\PasswordResetLinkController as GestionResetLink;
use App\Http\Controllers\Gestion\DashboardController;
use App\Http\Controllers\Gestion\WeddingController;
use App\Http\Controllers\Portail\Auth\AuthenticatedSessionController as PortailSession;
use App\Http\Controllers\Portail\Auth\NewPasswordController as PortailNewPassword;
use App\Http\Controllers\Portail\Auth\PasswordResetLinkController as PortailResetLink;
use App\Http\Controllers\Portail\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes web (Inertia)
|--------------------------------------------------------------------------
|
| /gestion/*  → back-office de la coordinatrice, guard "manager"
| /*          → portail des mariés, guard "couple"
|
| Les deux espaces vivent dans la même application Laravel mais derrière des
| guards distincts : une session ouverte sur l'un ne donne aucun accès aux
| routes de l'autre.
|
*/

Route::prefix('gestion')->name('gestion.')->group(function () {
    Route::middleware('guest:manager')->group(function () {
        Route::get('login', [GestionSession::class, 'create'])->name('login');
        Route::post('login', [GestionSession::class, 'store'])
            ->middleware('throttle:login')
            ->name('login.store');

        Route::get('forgot-password', [GestionResetLink::class, 'create'])->name('password.request');
        Route::post('forgot-password', [GestionResetLink::class, 'store'])
            ->middleware('throttle:password-reset')
            ->name('password.email');

        Route::get('reset-password/{token}', [GestionNewPassword::class, 'create'])->name('password.reset');
        Route::post('reset-password', [GestionNewPassword::class, 'store'])
            ->middleware('throttle:password-reset')
            ->name('password.store');
    });

    Route::middleware('auth:manager')->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::post('logout', [GestionSession::class, 'destroy'])->name('logout');

        Route::apiResource('weddings', WeddingController::class);

        // Les pages du back-office s'ajoutent ici, toutes derrière auth:manager.
    });
});

Route::name('portail.')->group(function () {
    Route::middleware('guest:couple')->group(function () {
        Route::get('login', [PortailSession::class, 'create'])->name('login');
        Route::post('login', [PortailSession::class, 'store'])
            ->middleware('throttle:login')
            ->name('login.store');

        Route::get('forgot-password', [PortailResetLink::class, 'create'])->name('password.request');
        Route::post('forgot-password', [PortailResetLink::class, 'store'])
            ->middleware('throttle:password-reset')
            ->name('password.email');

        Route::get('reset-password/{token}', [PortailNewPassword::class, 'create'])->name('password.reset');
        Route::post('reset-password', [PortailNewPassword::class, 'store'])
            ->middleware('throttle:password-reset')
            ->name('password.store');
    });

    Route::middleware('auth:couple')->group(function () {
        Route::get('/', HomeController::class)->name('home');
        Route::post('logout', [PortailSession::class, 'destroy'])->name('logout');

        // Les pages du portail s'ajoutent ici, toutes derrière auth:couple.
    });
});
