<?php

namespace App\Http\Controllers\Api\V1\Gestion;

use App\Http\Controllers\Controller;
use App\Models\Weddings;
use Illuminate\Http\Request;

class WeddingController extends Controller
{
    /**
     * Récupérer tous les mariages.
     */
    public function index()
    {
        $weddings = Weddings::all();

        return response()->json($weddings, 200);
    }

    /**
     * Créer un nouveau mariage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'wedding_date' => 'required|date',
            'guest_count' => 'required|integer|min:0',
            'status' => 'required|string|max:50',
            'memories' => 'nullable|string|max:500',
        ]);

        // Création manuelle du Model
        $wedding = new Weddings();

        $wedding->wedding_date = $validated['wedding_date'];
        $wedding->guest_count = $validated['guest_count'];
        $wedding->status = $validated['status'];
        $wedding->memories = $validated['memories'] ?? null;

        // Enregistrement en base de données
        $wedding->save();

        return response()->json($wedding, 201);
    }

    /**
     * Récupérer un mariage par son ID.
     */
    public function show(string $id)
    {
        $wedding = Weddings::where('id', $id)->first();

        // Vérifier si le mariage existe
        if ($wedding === null) {
            return response()->json([
                'message' => 'Mariage introuvable'
            ], 404);
        }

        return response()->json($wedding, 200);
    }

    /**
     * Modifier un mariage.
     */
    public function update(Request $request, string $id)
    {
        $wedding = Weddings::where('id', $id)->first();

        // Vérifier si le mariage existe
        if ($wedding === null) {
            return response()->json([
                'message' => 'Mariage introuvable'
            ], 404);
        }

        $validated = $request->validate([
            'wedding_date' => 'sometimes|required|date',
            'guest_count' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|string|max:50',
            'memories' => 'sometimes|nullable|string|max:500',
        ]);

        // Modification uniquement des champs reçus
        foreach ($validated as $key => $value) {
            $wedding->$key = $value;
        }

        // Enregistrement des modifications
        $wedding->save();

        return response()->json($wedding, 200);
    }

    /**
     * Supprimer un mariage.
     */
    public function destroy(string $id)
    {
        $wedding = Weddings::where('id', $id)->first();

        // Vérifier si le mariage existe
        if ($wedding === null) {
            return response()->json([
                'message' => 'Mariage introuvable'
            ], 404);
        }

        $wedding->delete();

        return response()->json([
            'message' => 'Mariage supprimé avec succès'
        ], 200);
    }
}
