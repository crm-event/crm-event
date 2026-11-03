<?php

use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Couple\CommunityController;
use App\Http\Controllers\Couple\HomeController as CoupleHomeController;
use App\Http\Controllers\Couple\MessageController as CoupleMessageController;
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

        Route::get('/communaute', [CommunityController::class, 'index'])->name('community.index');
        Route::post('/communaute', [CommunityController::class, 'store'])->name('community.store');
        Route::delete('/communaute/{communityPost}', [CommunityController::class, 'destroy'])->name('community.destroy');
    });

Route::middleware('auth')
    ->prefix('espace')
    ->name('couple.')
    ->group(function () {
        Route::get('/messages', [CoupleMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages', [CoupleMessageController::class, 'store'])->name('messages.store');
    });

Route::middleware(['auth', 'role:admin'])
    ->prefix('espace')
    ->name('admin.')
    ->group(function () {
        Route::get('/messages/{couple}', [AdminMessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{couple}', [AdminMessageController::class, 'store'])->name('messages.store');
    });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
