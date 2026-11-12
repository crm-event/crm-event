<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaItem;
use App\Models\Proposal;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Design tab of the wedding file: Jessica reads what the couple shared and
 * sends them design proposals.
 */
class DesignController extends Controller
{
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
}
