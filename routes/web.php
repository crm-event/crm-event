<?php

use App\Http\Controllers\Couple\HomeController as CoupleHomeController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', LandingController::class)->name('home');

Route::middleware(['auth', 'role:couple'])
    ->prefix('espace')
    ->name('couple.')
    ->group(function () {
        Route::get('/', CoupleHomeController::class)->name('home');
    });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('demandes')->group(function () {
    Route::get('/', [DemandeController::class, 'index'])->name('demandes');
    Route::post('/', [DemandeController::class, 'store'])->name('demandes.store');
    Route::post('/import', [DemandeController::class, 'import'])->name('demandes.import');
    Route::patch('/{demande}', [DemandeController::class, 'update'])->whereNumber('demande')->name('demandes.update');
    Route::patch('/{demande}/notes', [DemandeController::class, 'addNote'])->whereNumber('demande')->name('demandes.notes.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
