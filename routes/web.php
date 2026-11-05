<?php

use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Couple\CommunityController;
use App\Http\Controllers\Couple\DocumentController;
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
        Route::get('/design', function () {
            return Inertia::render('Couple/Design', [
                'project' => [
                    'couple' => 'Clémence & Alexandre',
                    'date' => '28 juin 2025',
                    'venue' => 'Château de Sannes · Lubéron',
                    'status' => 'En cours de conception',
                    'step' => 3,
                ],
                'brief' => [
                    'title' => 'Un jardin méditerranéen au coucher du soleil',
                    'description' => 'Nous imaginons un mariage élégant et naturel dans un domaine provençal. Nous aimons les tons ivoire, sable, vert sauge et terracotta très doux. Nous souhaitons une atmosphère chaleureuse, avec beaucoup de fleurs blanches, des matières naturelles et une décoration raffinée sans être trop chargée.',
                    'moodboard' => ['src' => '/images/landing/wedding-design.jpg', 'alt' => 'Moodboard du mariage de Clémence et Alexandre'],
                    'colors' => ['Ivoire', 'Lin', 'Vert sauge', 'Argile'],
                    'avoid' => 'Les couleurs trop vives et les compositions trop symétriques.',
                    'images' => [
                        ['id' => 1, 'src' => '/images/landing/wedding-design.jpg', 'alt' => 'Décoration de mariage naturelle'],
                        ['id' => 2, 'src' => '/images/landing/accueil2.jpg', 'alt' => 'Détails floraux et matières naturelles'],
                        ['id' => 3, 'src' => '/images/landing/accueil1.jpg', 'alt' => 'Cérémonie en extérieur'],
                    ],
                ],
                'versions' => [
                    [
                        'id' => 1,
                        'number' => '01',
                        'title' => 'Jardin méditerranéen',
                        'date' => '12 février 2025',
                        'status' => 'À découvrir',
                        'description' => 'Une direction artistique inspirée des jardins méditerranéens au coucher du soleil. La palette reste lumineuse et naturelle, avec des textures apportées par le bois clair, la céramique artisanale et des compositions florales souples.',
                        'colors' => ['Ivoire', 'Sauge', 'Argile douce'],
                        'images' => ['/images/landing/wedding-design.jpg', '/images/landing/coordination.jpg', '/images/landing/accueil2.jpg'],
                    ],
                    [
                        'id' => 2,
                        'number' => '02',
                        'title' => 'La douceur des matières',
                        'date' => 'En préparation',
                        'status' => 'Bientôt disponible',
                        'description' => 'Jessica prépare une seconde proposition à partir de vos premières inspirations et de vos retours.',
                        'colors' => [],
                        'images' => [],
                    ],
                ],
            ]);
        })->name('design.index');

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
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/demandes', function () {
    return Inertia::render('Demandes');
})->middleware(['auth', 'verified'])->name('demandes');

Route::get('/calendrier', function () {
    return Inertia::render('Calendrier');
})->middleware(['auth', 'verified'])->name('calendrier');

Route::get('/wedding', function () {
    return Inertia::render('Wedding');
})->middleware(['auth', 'verified'])->name('wedding');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
