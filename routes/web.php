<?php

use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Admin\RentabiliteController;
use App\Http\Controllers\Couple\CommunityController;
use App\Http\Controllers\Couple\DesignController;
use App\Http\Controllers\Couple\DocumentController;
use App\Http\Controllers\Couple\HomeController as CoupleHomeController;
use App\Http\Controllers\Couple\MessageController as CoupleMessageController;
use App\Http\Controllers\Couple\WeddingController as CoupleWeddingController;
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
        Route::get('/mariage', CoupleWeddingController::class)->name('wedding.show');
        Route::get('/design', [DesignController::class, 'index'])->name('design.index');

        Route::get('/communaute', [CommunityController::class, 'index'])->name('community.index');
        Route::post('/communaute', [CommunityController::class, 'store'])->name('community.store');
        Route::delete('/communaute/{communityPost}', [CommunityController::class, 'destroy'])->name('community.destroy');

        Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::post('/documents/{document}/approve', [DocumentController::class, 'approve'])->name('documents.approve');

        Route::get('/messages', [CoupleMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages', [CoupleMessageController::class, 'store'])->name('messages.store');
        Route::get('/messages/{message}/voice', [CoupleMessageController::class, 'voice'])->name('messages.voice');
        Route::patch('/messages/{message}', [CoupleMessageController::class, 'update'])->name('messages.update');
        Route::delete('/messages/{message}', [CoupleMessageController::class, 'destroy'])->name('messages.destroy');
    });

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin/documents')
    ->name('admin.documents.')
    ->group(function () {
        Route::get('/', [AdminDocumentController::class, 'index'])->name('index');
        Route::post('/', [AdminDocumentController::class, 'store'])->name('store');
    });

Route::middleware(['auth', 'role:admin'])
    ->prefix('messages')
    ->name('admin.messages.')
    ->group(function () {
        Route::get('/', [AdminMessageController::class, 'index'])->name('index');
        Route::get('/{couple}', [AdminMessageController::class, 'show'])->name('show');
        Route::post('/{couple}', [AdminMessageController::class, 'store'])->name('store');
        Route::get('/{message}/voice', [AdminMessageController::class, 'voice'])->name('voice');
        Route::patch('/{message}', [AdminMessageController::class, 'update'])->name('update');
        Route::delete('/{message}', [AdminMessageController::class, 'destroy'])->name('destroy');
    });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('dashboard');

Route::get('/demandes', function () {
    return Inertia::render('Demandes');
})->middleware(['auth', 'verified', 'role:admin'])->name('demandes');

Route::get('/calendrier', function () {
    return Inertia::render('Calendrier');
})->middleware(['auth', 'verified'])->name('calendrier');

Route::get('/wedding', function () {
    return Inertia::render('Wedding');
})->middleware(['auth', 'verified'])->name('wedding');

Route::get('/demandes', function () {
    return Inertia::render('Demandes');
})->middleware(['auth', 'verified'])->name('demandes');

Route::middleware(['auth', 'role:admin'])
    ->prefix('rentabilite')
    ->name('rentabilite.')
    ->group(function () {
        Route::get('/', [RentabiliteController::class, 'index'])->name('index');
        Route::get('/rapport', [RentabiliteController::class, 'report'])->name('rapport');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
