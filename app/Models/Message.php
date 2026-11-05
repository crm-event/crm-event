<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\MessageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * @return array{id: int, body: string|null, voice_note_url: string|null, is_own: bool, sender_is_admin: bool, sent_at: string, read_at: string|null}
     */
    public function toThreadItem(User $viewer): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'voice_note_url' => $this->voice_note_path === null
                ? null
                : route(
                    $viewer->hasRole(UserRole::Admin) ? 'admin.messages.voice' : 'couple.messages.voice',
                    $this,
                ),
            'is_own' => $this->sender_id === $viewer->id,
            'sender_is_admin' => $this->sender?->hasRole(UserRole::Admin) ?? false,
            'sent_at' => $this->created_at->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }

    /**
     * Only keep the messages the given user has not read yet, i.e. the unread
     * messages sent by someone else.
     *
     * @param  Builder<Message>  $query
     */
    public function scopeUnreadFor(Builder $query, User $reader): void
    {
        $query->whereNull('messages.read_at')
            ->where(fn (Builder $query) => $query
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
