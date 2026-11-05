<?php

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Private thread between the logged-in couple and Jessica.
 */
class MessageController extends Controller
{
    /**
     * Display the thread and mark Jessica's messages as read.
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        $couple = $user->couple;

        $messages = $couple?->messages()->with('sender')->get() ?? collect();

        Message::markAsReadBy($user, $messages);

        return Inertia::render('Couple/Messages', [
            'messages' => $messages->map(fn (Message $message) => $message->toThreadItem($user))->values(),
            'canWrite' => $couple?->latestWedding !== null,
            'maxBodyLength' => StoreMessageRequest::MAX_BODY_LENGTH,
        ]);
    }

    /**
     * Send a message to Jessica, attached to the couple's latest wedding.
     *
     * @throws ValidationException
     */
    public function store(StoreMessageRequest $request): RedirectResponse
    {
        $wedding = $request->user()->couple?->latestWedding;

        if ($wedding === null) {
            throw ValidationException::withMessages([
                'body' => 'Votre dossier n’est pas encore ouvert : Jessica vous préviendra dès que la messagerie sera disponible.',
            ]);
        }

        $wedding->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'voice_note_path' => $request->file('voice_note')?->store('voice-notes'),
        ]);

        return to_route('couple.messages.index');
    }

    /**
     * Stream a voice note belonging to the logged-in couple.
     */
    public function voice(Request $request, Message $message): Response
    {
        abort_unless(
            $message->wedding->couple_id === $request->user()->couple?->id,
            403,
        );

        abort_unless($message->voice_note_path !== null, 404);

        return Storage::response($message->voice_note_path);
    }
}
