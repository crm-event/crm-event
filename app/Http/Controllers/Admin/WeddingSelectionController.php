<?php

namespace App\Http\Controllers\Admin;

use App\Models\Wedding;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller of the admin selector of the weddings
 */
class WeddingSelectionController
{
    /**
     * List of the weddings ordered by the date of the wedding and their place
     * in the alphabetical order
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
     * Display the Wedding through inertia. link back to the error landing page 
     * if an error occur.
     */
    public function show(int $id): Response
    {
        $wedding = Wedding::with([
           'couple',
           'venue',
           'weddingServices.service',
           'vendors.category',
           'timelineItems',
           'documents' 
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
            'documents' => $wedding->documents
        ]);
    }
}
