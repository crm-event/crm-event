<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Weddings;
use Illuminate\Http\Request;

class WeddingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Weddings::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'integer|required',
            'wedding_date' => 'date|required',
            'guest_count' => 'integer|required',
            'status' => 'string|required|max:50',
            'memories' => 'text|nullable|max:500',
            'created_at' => 'date|required',
            'deleted_at' => 'date|nullable',
        ]);

        $weddings = Weddings::create($validated);

        return response()->json($weddings, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(Weddings::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $weddings = Weddings::findOrFail($id);

        $validated = $request->validate([
            'wedding_date' => 'sometimes|date|required',
            'guest_count' => 'sometimes|integer|required',
            'status' => 'sometimes|string|required|max:50',
            'memories' => 'sometimes|text|nullable|max:500',
            'deleted_at' => 'date|nullable',
        ]);

        $weddings->update($validated);

        return response()->json($weddings);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $weddings = Weddings::findOrFail($id);
        $weddings->delete();
        return response()->json(null, 204);
    }
}
