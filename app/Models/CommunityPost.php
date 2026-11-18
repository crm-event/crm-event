<?php

namespace App\Models;

use Database\Factories\CommunityPostFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Message posted in the community space shared by all couples.
 *
 * A post is either a top-level message (`parent_id` null) or a reply to a
 * top-level message: replies only go one level deep. Deleting a message
 * deletes its replies; deleting an account keeps its messages, without author.
 */
class CommunityPost extends Model
{
    /** @use HasFactory<CommunityPostFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'body',
    ];

    /**
     * The account that wrote the message, null if it has been deleted.
     *
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The message this post replies to, null for a top-level message.
     *
     * @return BelongsTo<CommunityPost, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'parent_id');
    }

    /**
     * The replies to this message, oldest first.
     *
     * @return HasMany<CommunityPost, $this>
     */
    public function replies(): HasMany
    {
        return $this->hasMany(CommunityPost::class, 'parent_id')->oldest();
    }

    /**
     * Determine whether the message is a reply to another message.
     */
    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Only keep top-level messages.
     *
     * @param  Builder<CommunityPost>  $query
     */
    public function scopeTopLevel(Builder $query): void
    {
        $query->whereNull('parent_id');
    }
}
