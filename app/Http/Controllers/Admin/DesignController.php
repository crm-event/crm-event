<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProposalCommentRequest;
use App\Http\Requests\StoreProposalRequest;
use App\Models\MediaItem;
use App\Models\Proposal;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Design tab of the wedding file: Jessica reads what the couple shared and
 * sends them design proposals.
 */
class DesignController extends Controller
{
    /**
     * Send a new version to the couple. Its file is also a document of the
     * couple space; the version is numbered within its type.
     */
    public function storeProposal(StoreProposalRequest $request, Wedding $wedding): RedirectResponse
    {
        $file = $request->file('file');
        $path = $file->store('documents');
        $type = $request->validated('type');

        DB::transaction(function () use ($request, $wedding, $file, $path, $type): void {
            $document = $wedding->documents()->create([
                'uploaded_by' => $request->user()->id,
                'category' => 'design',
                'title' => $request->validated('title'),
                'message' => $request->validated('description'),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
                // The couple answers on the Design page, not in the documents.
                'requires_approval' => false,
            ]);

            $wedding->proposals()->create([
                'document_id' => $document->id,
                'type' => $type,
                'title' => $request->validated('title'),
                'version' => (int) $wedding->proposals()->where('type', $type)->max('version') + 1,
                'description' => $request->validated('description'),
            ]);
        });

        return $this->backToDesignTab($wedding)->with('success', 'Version envoyée au couple.');
    }

    /**
     * Answer the couple under a version.
     */
    public function storeComment(StoreProposalCommentRequest $request, Proposal $proposal): RedirectResponse
    {
        $proposal->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return $this->backToDesignTab($proposal->wedding);
    }

    /**
     * Display an image shared by a couple (moodboard or inspiration).
     */
    public function showMedia(MediaItem $mediaItem): StreamedResponse
    {
        abort_unless(Storage::exists($mediaItem->file_path), 404);

        return Storage::response($mediaItem->file_path, $mediaItem->title, [
            'Content-Type' => $mediaItem->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * Display the file of a proposal in the browser, for its preview.
     */
    public function showProposalFile(Proposal $proposal): StreamedResponse
    {
        $document = $proposal->document;

        abort_unless($document !== null && Storage::exists($document->file_path), 404);

        return Storage::response($document->file_path, $document->title, [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * The wedding file, opened on its Design tab.
     */
    private function backToDesignTab(Wedding $wedding): RedirectResponse
    {
        return to_route('admin.wedding.show', ['id' => $wedding->id, 'onglet' => 'design']);
    }
}
