<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Couple\CommunityController;
use App\Http\Controllers\Couple\HomeController as CoupleHomeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Support\CalendarSchedule;
use Illuminate\Http\Request;
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

Route::get('/dashboard', function (Request $request, CalendarSchedule $calendar) {
    return Inertia::render('Dashboard', [
        'evenementsTous' => $request->user()->hasRole(UserRole::Admin) ? $calendar->events() : [],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/calendrier', [CalendarController::class, 'index'])->name('calendrier');
    Route::post('/calendrier/evenements', [CalendarController::class, 'store'])->name('calendrier.events.store');
    Route::post('/calendrier/import', [CalendarController::class, 'import'])->name('calendrier.import');
    Route::patch('/calendrier/evenements/{calendarEvent}', [CalendarController::class, 'update'])->name('calendrier.events.update');
    Route::delete('/calendrier/evenements/{calendarEvent}', [CalendarController::class, 'destroy'])->name('calendrier.events.destroy');
});

Route::get('/wedding', function () {
    return Inertia::render('Wedding');
})->middleware(['auth', 'verified'])->name('wedding');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
