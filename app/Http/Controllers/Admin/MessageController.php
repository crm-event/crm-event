<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Couple;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Jessica's inbox: one private thread per couple.
 */
class MessageController extends Controller
{
    /**
     * List the couples who have access to their space, the threads with the
     * most recent activity first.
     */
    public function index(Request $request): Response
    {
        $admin = $request->user();

        $threads = Couple::query()
            ->whereNotNull('user_id')
            ->withCount(['messages as unread_count' => fn ($query) => $query->unreadFor($admin)])
            ->get()
            ->map(function (Couple $couple) {
                $lastMessage = $couple->messages()
                    ->reorder()
                    ->latest('messages.created_at')
                    ->latest('messages.id')
                    ->first();

                return [
                    'couple_id' => $couple->id,
                    'title' => $couple->threadTitle(),
                    'unread_count' => $couple->unread_count,
                    'last_message' => $lastMessage?->body,
                    'last_message_at' => $lastMessage?->created_at->toIso8601String(),
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return Inertia::render('Admin/Messages/Index', [
            'threads' => $threads,
        ]);
    }

    /**
     * Display the thread with a couple and mark the couple's messages as read.
     */
    public function show(Request $request, Couple $couple): Response
    {
        $admin = $request->user();
        $messages = $couple->messages()->with('sender')->get();

        Message::markAsReadBy($admin, $messages);

        return Inertia::render('Admin/Messages/Show', [
            'couple' => [
                'id' => $couple->id,
                'title' => $couple->threadTitle(),
            ],
            'messages' => $messages->map(fn (Message $message) => $message->toThreadItem($admin))->values(),
            'canWrite' => $couple->latestWedding !== null,
            'maxBodyLength' => StoreMessageRequest::MAX_BODY_LENGTH,
        ]);
    }

    /**
     * Reply to a couple, on their latest wedding.
     *
     * @throws ValidationException
     */
    public function store(StoreMessageRequest $request, Couple $couple): RedirectResponse
    {
        $wedding = $couple->latestWedding;

        if ($wedding === null) {
            throw ValidationException::withMessages([
                'body' => 'Ce couple n’a pas encore de mariage enregistré : créez-le avant de lui écrire.',
            ]);
        }

        $wedding->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return to_route('admin.messages.show', $couple);
    }
}
