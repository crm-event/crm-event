<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Couple;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Documents uploaded by Jessica for the couple space.
 */
class DocumentController extends Controller
{
    /**
     * Display the document upload form.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Documents/Index', [
            'couples' => Couple::query()
                ->whereNotNull('user_id')
                ->orderBy('partner1_first_name')
                ->get(['id', 'partner1_first_name', 'partner2_first_name']),
            'categories' => [
                ['value' => 'contract', 'label' => 'Contrat'],
                ['value' => 'terms', 'label' => 'Conditions générales de vente'],
                ['value' => 'design', 'label' => 'Carnet de design'],
                ['value' => 'appointment', 'label' => 'Rendez-vous'],
                ['value' => 'misc', 'label' => 'Autre'],
            ],
        ]);
    }

    /**
     * Store a document in private storage and attach it to the latest wedding.
     */
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $couple = Couple::query()->findOrFail($request->validated('couple_id'));
        $wedding = $couple->latestWedding;

        abort_unless($wedding !== null, 422, 'Ce couple n’a pas encore de mariage enregistré.');

        $file = $request->file('file');
        $path = $file->store('documents');

        $wedding->documents()->create([
            'uploaded_by' => $request->user()->id,
            'category' => $request->validated('category'),
            'title' => $request->validated('title'),
            'message' => $request->validated('message'),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'requires_approval' => $request->boolean('requires_approval'),
        ]);

        return to_route('admin.documents.index')->with('success', 'Document envoyé au couple.');
    }
}
