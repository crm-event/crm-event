<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Wedding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Design page of the logged-in couple.
 */
class DesignController extends Controller
{
    /**
     * Display where the project stands and the design versions shared by Jessica.
     */
    public function index(Request $request): Response
    {
        $wedding = $request->user()->couple?->latestWedding;

        return Inertia::render('Couple/Design', [
            'project' => $wedding === null ? null : $this->toProject($wedding),
            'versions' => $wedding === null ? [] : $this->versionsOf($wedding),
        ]);
    }

    /**
     * Transform a wedding for the summary of the page.
     *
     * @return array{couple: string, date: string|null, venue: string|null, status: string}
     */
    private function toProject(Wedding $wedding): array
    {
        $venue = $wedding->venue === null
            ? null
            : collect([$wedding->venue->name, $wedding->venue->city])->filter()->join(' · ');

        return [
            'couple' => $wedding->couple->firstNames(),
            'date' => $wedding->wedding_date?->toDateString(),
            'venue' => $venue,
            'status' => self::statusLabel($wedding->status),
        ];
    }

    /**
     * The design documents of a wedding, numbered from the oldest and sorted
     * from the latest.
     *
     * @return list<array{id: int, number: int, title: string, description: string|null, created_at: string, approved_at: string|null, awaiting_approval: bool, download_url: string|null}>
     */
    private function versionsOf(Wedding $wedding): array
    {
        return $wedding->documents()
            ->where('category', 'design')
            ->oldest()
            ->oldest('id')
            ->get()
            ->values()
            ->map(fn (Document $document, int $index) => [
                'id' => $document->id,
                'number' => $index + 1,
                'title' => $document->title,
                'description' => $document->message,
                'created_at' => $document->created_at->toIso8601String(),
                'approved_at' => $document->approved_at?->toIso8601String(),
                'awaiting_approval' => $document->requires_approval && $document->approved_at === null,
                'download_url' => Storage::exists($document->file_path)
                    ? route('couple.documents.download', $document)
                    : null,
            ])
            ->reverse()
            ->values()
            ->all();
    }

    /**
     * Return the display label of a wedding status (see docs/bdd/README.md).
     */
    private static function statusLabel(string $status): string
    {
        return match ($status) {
            'inquiry' => 'Demande reçue',
            'quote_sent' => 'Devis envoyé',
            'booked' => 'Contrat signé',
            'completed' => 'Mariage célébré',
            'closed' => 'Dossier clôturé',
            'cancelled' => 'Projet annulé',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }
}
