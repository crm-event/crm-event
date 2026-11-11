<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Support\StandardText;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Documents shared with the logged-in couple.
 */
class DocumentController extends Controller
{
    /**
     * Display the couple's documents grouped by category.
     */
    public function index(Request $request): Response
    {
        $couple = $request->user()->couple;

        // Opening the page counts as viewing the documents: mark them first so
        // that the page already shows them as viewed.
        $couple?->documents()->whereNull('documents.viewed_at')->update(['viewed_at' => now()]);

        $documents = $couple?->documents()->latest('documents.created_at')->get() ?? collect();

        return Inertia::render('Couple/Documents', [
            'categories' => $documents
                ->groupBy('category')
                ->map(fn ($categoryDocuments, string $category) => [
                    'key' => $category,
                    'label' => self::categoryLabel($category),
                    'documents' => $categoryDocuments->map(fn (Document $document) => $this->toItem($document))->values(),
                ])
                ->sortBy(function (array $category): int {
                    $position = array_search($category['key'], ['contract', 'terms', 'design', 'appointment'], true);

                    return $position === false ? 99 : $position;
                })
                ->values(),
        ]);
    }

    /**
     * Download a document belonging to the logged-in couple.
     */
    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->ensureBelongsToCouple($request, $document);

        abort_unless(Storage::exists($document->file_path), 404);

        return Storage::download($document->file_path, basename($document->file_path), [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * Approve a document requiring approval.
     */
    public function approve(Request $request, Document $document): RedirectResponse
    {
        $this->ensureBelongsToCouple($request, $document);

        abort_unless($document->requires_approval, 422, __('couple.document_approval_not_needed'));

        // viewed_at and approved_at are not mass assignable: a request must never set them.
        $document->forceFill([
            'viewed_at' => $document->viewed_at ?? now(),
            'approved_at' => now(),
        ])->save();

        // Documents can be approved from the Documents page or the Design page.
        return back(fallback: route('couple.documents.index'));
    }

    /**
     * Transform a document for the couple page.
     *
     * @return array{id: int, title: string, message: string|null, created_at: string, viewed_at: string|null, size_label: string, approved_at: string|null, requires_approval: bool, download_url: string|null, downloadable: bool, status: string, status_label: string}
     */
    private function toItem(Document $document): array
    {
        $status = match (true) {
            $document->approved_at !== null => 'approved',
            $document->requires_approval => 'pending',
            $document->viewed_at !== null => 'viewed',
            default => 'available',
        };

        return [
            'id' => $document->id,
            'title' => $document->title,
            'message' => StandardText::translate($document->message),
            'created_at' => $document->created_at->toIso8601String(),
            'viewed_at' => $document->viewed_at?->toIso8601String(),
            'size_label' => self::formatSize($document->size_bytes),
            'approved_at' => $document->approved_at?->toIso8601String(),
            'requires_approval' => $document->requires_approval,
            'download_url' => Storage::exists($document->file_path)
                ? route('couple.documents.download', $document)
                : null,
            'downloadable' => Storage::exists($document->file_path),
            'status' => $status,
            'status_label' => __("couple.document_statuses.{$status}"),
        ];
    }

    /**
     * Ensure that the document belongs to the current couple.
     */
    private function ensureBelongsToCouple(Request $request, Document $document): void
    {
        abort_unless($document->wedding->couple_id === $request->user()->couple?->id, 403);
    }

    /**
     * Return the display label of a document category.
     */
    private static function categoryLabel(string $category): string
    {
        return match ($category) {
            'contract', 'terms', 'design', 'quote', 'appointment' => __("couple.document_categories.{$category}"),
            'general_conditions' => __('couple.document_categories.terms'),
            default => ucfirst(str_replace('_', ' ', $category)),
        };
    }

    /**
     * Format a document size as displayed in the couple space.
     */
    private static function formatSize(?int $bytes): string
    {
        if ($bytes === null) {
            return '';
        }

        if ($bytes < 1024) {
            return __('couple.file_size.bytes', ['size' => $bytes]);
        }

        $kilobytes = number_format($bytes / 1024, 0, '', __('couple.file_size.thousands_separator'));

        return __('couple.file_size.kilobytes', ['size' => $kilobytes]);
    }
}
