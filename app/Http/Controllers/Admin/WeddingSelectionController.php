<?php

namespace App\Http\Controllers\Admin;

use App\Models\Wedding;
use Inertia\Inertia;
use Inertia\Response;

class WeddingSelectionController
{
    /**
     * Show the list of weddings
     */
    public function index(): Response
    {
        $weddings = Wedding::with('couple')
            ->orderBy('wedding_date', 'asc')
            ->get();

        return Inertia::render('Wedding/WeddingSelection', [
            'weddings' => $weddings,
        ]);
    }

    /**
     * Affiche le mariage sélectionné.
     */
    public function show(int $id): Response
    {
        $wedding = Wedding::with([
           'couple',
           'venue',
           'weddingServices',
           'vendors',
           'timelineItems' 
        ])
        ->where('id', $id)
        ->first();

        if (!$wedding) {
            abort(404);
        }

        return Inertia::render('Wedding/Wedding', [
            'wedding' => $wedding,
            'prestations' => $wedding->weddingServices,
            'prestataires' => $wedding->vendors,
            'milestones' => $wedding->timelineItems,
        ]);
    }
}
