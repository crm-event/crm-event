<?php

use App\Http\Controllers\AccessRequestController;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Admin\CoupleController as AdminCoupleController;
use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Admin\RentabiliteController;
use App\Http\Controllers\Couple\AppointmentController as CoupleAppointmentController;
use App\Http\Controllers\Couple\CommunityController;
use App\Http\Controllers\Couple\DesignController;
use App\Http\Controllers\Couple\DocumentController;
use App\Http\Controllers\Couple\HomeController as CoupleHomeController;
use App\Http\Controllers\Couple\MessageController as CoupleMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', LandingController::class)->name('home');
Route::post('/demande-acces', AccessRequestController::class)->name('access-request.store');
Route::inertia('/mentions-legales', 'LegalNotice')->name('legal-notice');

Route::middleware(['auth', 'role:couple'])
    ->prefix('espace')
    ->name('couple.')
    ->group(function () {
        Route::get('/', CoupleHomeController::class)->name('home');
        Route::get('/design', [DesignController::class, 'index'])->name('design.index');
        Route::put('/design/brief', [DesignController::class, 'updateBrief'])->name('design.brief.update');
        Route::post('/design/images', [DesignController::class, 'storeMedia'])->name('design.media.store');
        Route::get('/design/images/{mediaItem}', [DesignController::class, 'showMedia'])->name('design.media.show');
        Route::delete('/design/images/{mediaItem}', [DesignController::class, 'destroyMedia'])->name('design.media.destroy');
        Route::get('/rendez-vous', [CoupleAppointmentController::class, 'index'])->name('appointments.index');
        Route::inertia('/mentions-legales', 'Couple/LegalNotice')->name('legal-notice');

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
    ->prefix('admin/couples')
    ->name('admin.couples.')
    ->group(function () {
        Route::get('/', [AdminCoupleController::class, 'index'])->name('index');
        Route::post('/', [AdminCoupleController::class, 'store'])->name('store');
        Route::post('/{couple}/accept', [AdminCoupleController::class, 'accept'])->name('accept');
        Route::post('/{couple}/refuse', [AdminCoupleController::class, 'refuse'])->name('refuse');
        Route::post('/{couple}/temporary-code', [AdminCoupleController::class, 'issueTemporaryCode'])->name('temporary-code');
    });

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin/documents')
    ->name('admin.documents.')
    ->group(function () {
        Route::get('/', [AdminDocumentController::class, 'index'])->name('index');
        Route::post('/', [AdminDocumentController::class, 'store'])->name('store');
        Route::get('/{document}/download', [AdminDocumentController::class, 'download'])->name('download');
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

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified', 'role:admin'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('demandes')->group(function () {
    Route::get('/', [DemandeController::class, 'index'])->name('demandes');
    Route::post('/', [DemandeController::class, 'store'])->name('demandes.store');
    Route::post('/import', [DemandeController::class, 'import'])->name('demandes.import');
    Route::patch('/{demande}', [DemandeController::class, 'update'])->whereNumber('demande')->name('demandes.update');
    Route::patch('/{demande}/notes', [DemandeController::class, 'addNote'])->whereNumber('demande')->name('demandes.notes.store');
});

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
