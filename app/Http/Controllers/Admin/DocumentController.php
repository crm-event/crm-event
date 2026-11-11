<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Couple;
use App\Models\Document;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Documents uploaded by Jessica for the couple space.
 */
class DocumentController extends Controller
{
    /**
     * Display the document upload form.
     */
    public function index(Request $request): Response
    {
        $selectedCouple = $request->filled('couple_id')
            ? Couple::query()
                ->whereNotNull('user_id')
                ->find($request->integer('couple_id'))
            : null;

        return Inertia::render('Admin/Documents/Index', [
            'couples' => $this->couples(),
            'selectedCouple' => $selectedCouple ? [
                'id' => $selectedCouple->id,
                'title' => $selectedCouple->threadTitle(),
            ] : null,
            'documents' => $selectedCouple?->documents()
                ->latest('documents.created_at')
                ->get()
                ->map(fn (Document $document): array => $this->toItem($document))
                ->values() ?? [],
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
     * Download a document from the back-office.
     */
    public function download(Document $document): StreamedResponse
    {
        abort_unless(Storage::exists($document->file_path), 404);

        return Storage::download($document->file_path, basename($document->file_path), [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * Return couples whose client space is available.
     *
     * @return Collection<int, Couple>
     */
    private function couples(): Collection
    {
        return Couple::query()
            ->whereNotNull('user_id')
            ->orderBy('partner1_first_name')
            ->get(['id', 'partner1_first_name', 'partner2_first_name']);
    }

    /**
     * Transform a document for the back-office list.
     *
     * @return array{id: int, title: string, category_label: string, message: string|null, created_at: string, size_label: string, viewed_at: string|null, approved_at: string|null, status: string, status_label: string, downloadable: bool, download_url: string|null}
     */
    private function toItem(Document $document): array
    {
        [$status, $statusLabel] = match (true) {
            $document->approved_at !== null => ['approved', 'Approuvé'],
            $document->requires_approval => ['pending', 'À approuver'],
            $document->viewed_at !== null => ['viewed', 'Consulté'],
            default => ['available', 'À consulter'],
        };

        $downloadable = Storage::exists($document->file_path);

        return [
            'id' => $document->id,
            'title' => $document->title,
            'category_label' => self::categoryLabel($document->category),
            'message' => $document->message,
            'created_at' => $document->created_at->toIso8601String(),
            'size_label' => self::formatSize($document->size_bytes),
            'viewed_at' => $document->viewed_at?->toIso8601String(),
            'approved_at' => $document->approved_at?->toIso8601String(),
            'status' => $status,
            'status_label' => $statusLabel,
            'downloadable' => $downloadable,
            'download_url' => $downloadable ? route('admin.documents.download', $document) : null,
        ];
    }

    private static function categoryLabel(string $category): string
    {
        return match ($category) {
            'contract' => 'Contrat',
            'terms', 'general_conditions' => 'Conditions générales de vente',
            'design' => 'Carnet de design',
            'quote' => 'Devis',
            'appointment' => 'Rendez-vous',
            default => ucfirst(str_replace('_', ' ', $category)),
        };
    }

    private static function formatSize(?int $bytes): string
    {
        if ($bytes === null) {
            return '';
        }

        if ($bytes < 1024) {
            return $bytes.' o';
        }

        return number_format($bytes / 1024, 0, ',', ' ').' Ko';
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
