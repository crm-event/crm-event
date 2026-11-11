<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\MessageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Private message between a couple and Jessica.
 *
 * Messages are attached to a wedding (see the `messages` table); the thread of
 * a couple gathers the messages of all its weddings. `read_at` is set when the
 * other party opens the thread.
 */
class Message extends Model
{
    /** @use HasFactory<MessageFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'sender_id',
        'body',
        'voice_note_path',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * The wedding the message is about.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /**
     * The account that sent the message, null if it has been deleted.
     *
     * @return BelongsTo<User, $this>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Data of the message as sent to a thread page, seen by `$viewer`.
     *
     * `voice_note_url` is null when the audio file is missing from the storage
     * disk, while `has_voice_note` stays true so that the page can say so. In
     * development the database is shared but each computer has its own
     * storage: a voice message recorded on another computer cannot be played.
     *
     * @return array{id: int, body: string|null, has_voice_note: bool, voice_note_url: string|null, is_own: bool, sender_is_admin: bool, sent_at: string, read_at: string|null}
     */
    public function toThreadItem(User $viewer): array
    {
        $hasVoiceNote = $this->voice_note_path !== null;

        return [
            'id' => $this->id,
            'body' => $this->body,
            'has_voice_note' => $hasVoiceNote,
            'voice_note_url' => ! $hasVoiceNote || ! Storage::exists($this->voice_note_path)
                ? null
                : route(
                    $viewer->hasRole(UserRole::Admin) ? 'admin.messages.voice' : 'couple.messages.voice',
                    $this,
                ),
            'is_own' => $this->isSentBySideOf($viewer),
            'sender_is_admin' => $this->sender?->hasRole(UserRole::Admin) ?? false,
            'sent_at' => $this->created_at->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }

    /**
     * Whether the message was sent by `$viewer`'s side of the thread.
     *
     * Jessica will have a single admin account, but there are several during
     * development: every admin speaks for her, so a message sent by any admin
     * is one of her own messages for every admin. A couple only owns the
     * messages sent from its own account.
     */
    public function isSentBySideOf(User $viewer): bool
    {
        if ($viewer->hasRole(UserRole::Admin)) {
            return $this->sender?->hasRole(UserRole::Admin) ?? false;
        }

        return $this->sender_id === $viewer->id;
    }

    /**
     * Only keep the messages the given user has not read yet, i.e. the unread
     * messages sent by the other side of the thread (see isSentBySideOf()).
     *
     * @param  Builder<Message>  $query
     */
    public function scopeUnreadFor(Builder $query, User $reader): void
    {
        $query->whereNull('messages.read_at');

        if ($reader->hasRole(UserRole::Admin)) {
            $query->whereDoesntHave('sender', fn (Builder $sender) => $sender->where('role', UserRole::Admin));

            return;
        }

        $query->where(fn (Builder $query) => $query
            ->whereNull('messages.sender_id')
            ->orWhere('messages.sender_id', '!=', $reader->id));
    }

    /**
     * Mark as read the messages of the given thread that `$reader` received.
     *
     * @param  iterable<Message>  $messages
     */
    public static function markAsReadBy(User $reader, iterable $messages): void
    {
        $ids = collect($messages)->pluck('id');

        static::query()->whereIn('id', $ids)->unreadFor($reader)->update(['read_at' => now()]);
    }
}
