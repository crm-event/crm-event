<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\Couple\StoreMediaItemRequest;
use App\Http\Requests\Couple\UpdateDesignBriefRequest;
use App\Models\DesignBrief;
use App\Models\Document;
use App\Models\MediaItem;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Design page of the logged-in couple: their creative brief, moodboard and
 * inspiration photos, then the design versions shared by Jessica.
 */
class DesignController extends Controller
{
    /**
     * Display the design of the couple's latest wedding.
     */
    public function index(Request $request): Response
    {
        $wedding = $request->user()->couple?->latestWedding;
        $mediaItems = $wedding?->mediaItems()->latest()->latest('id')->get() ?? collect();
        $moodboard = $mediaItems->firstWhere('collection', MediaItem::MOODBOARDS);

        return Inertia::render('Couple/Design', [
            'canEdit' => $wedding !== null,
            'brief' => $wedding?->designBrief === null ? null : $this->toBrief($wedding->designBrief),
            'moodboard' => $moodboard === null ? null : $this->toImage($moodboard),
            'inspirations' => $mediaItems
                ->where('collection', MediaItem::INSPIRATIONS)
                ->reverse()
                ->map(fn (MediaItem $item) => $this->toImage($item))
                ->values(),
            'versions' => $wedding === null ? [] : $this->versionsOf($wedding),
        ]);
    }

    /**
     * Save the creative brief of the couple.
     */
    public function updateBrief(UpdateDesignBriefRequest $request): RedirectResponse
    {
        $wedding = $this->weddingOf($request);

        $wedding->designBrief()->updateOrCreate([], $request->safe()->only(['title', 'description', 'palette', 'avoid']));

        return to_route('couple.design.index');
    }

    /**
     * Add an inspiration photo, or replace the moodboard.
     */
    public function storeMedia(StoreMediaItemRequest $request): RedirectResponse
    {
        $wedding = $this->weddingOf($request);
        $file = $request->file('file');
        $collection = $request->validated('collection');
        $path = $file->store("design/{$wedding->id}");

        $replacedMoodboards = $collection === MediaItem::MOODBOARDS
            ? $wedding->mediaItems()->where('collection', MediaItem::MOODBOARDS)->get()
            : collect();

        DB::transaction(function () use ($wedding, $request, $file, $collection, $path, $replacedMoodboards): void {
            $wedding->mediaItems()->create([
                'uploaded_by' => $request->user()->id,
                'collection' => $collection,
                'title' => $file->getClientOriginalName(),
                'alt_text' => __($collection === MediaItem::MOODBOARDS ? 'couple.media_alt.moodboard' : 'couple.media_alt.inspiration'),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ]);

            MediaItem::query()->whereKey($replacedMoodboards->pluck('id')->all())->delete();
        });

        Storage::delete($replacedMoodboards->pluck('file_path')->all());

        return to_route('couple.design.index');
    }

    /**
     * Display an image of the couple.
     */
    public function showMedia(Request $request, MediaItem $mediaItem): StreamedResponse
    {
        $this->ensureBelongsToCouple($request, $mediaItem);

        abort_unless(Storage::exists($mediaItem->file_path), 404);

        return Storage::response($mediaItem->file_path, $mediaItem->title, [
            'Content-Type' => $mediaItem->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * Remove an image of the couple.
     */
    public function destroyMedia(Request $request, MediaItem $mediaItem): RedirectResponse
    {
        $this->ensureBelongsToCouple($request, $mediaItem);

        $mediaItem->delete();
        Storage::delete($mediaItem->file_path);

        return to_route('couple.design.index');
    }

    /**
     * The wedding the couple is preparing: nothing can be saved without one.
     */
    private function weddingOf(Request $request): Wedding
    {
        $wedding = $request->user()->couple?->latestWedding;

        abort_if($wedding === null, 422, __('couple.wedding_not_recorded'));

        return $wedding;
    }

    /**
     * Ensure that the image belongs to the current couple.
     */
    private function ensureBelongsToCouple(Request $request, MediaItem $mediaItem): void
    {
        abort_unless($mediaItem->wedding->couple_id === $request->user()->couple?->id, 403);
    }

    /**
     * Transform the brief for the page.
     *
     * @return array{title: string|null, description: string|null, palette: list<string>, avoid: string|null}
     */
    private function toBrief(DesignBrief $brief): array
    {
        return [
            'title' => $brief->title,
            'description' => $brief->description,
            'palette' => array_values($brief->palette ?? []),
            'avoid' => $brief->avoid,
        ];
    }

    /**
     * Transform an image for the page. `url` is null when the file is missing
     * from this computer's storage (shared database in development).
     *
     * @return array{id: int, url: string|null, alt: string, created_at: string}
     */
    private function toImage(MediaItem $item): array
    {
        return [
            'id' => $item->id,
            'url' => Storage::exists($item->file_path) ? route('couple.design.media.show', $item) : null,
            'alt' => $item->alt_text ?? $item->title,
            'created_at' => $item->created_at->toIso8601String(),
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
}
