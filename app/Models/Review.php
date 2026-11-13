<?php

namespace App\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Review left by a couple after its wedding.
 *
 * The row is created when Jessica invites the couple (`requested_at`) and
 * filled in when the couple answers (`submitted_at`). There is at most one
 * review per wedding.
 */
class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'requested_at',
        'rating',
        'would_recommend',
        'body',
        'submitted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'submitted_at' => 'datetime',
            'would_recommend' => 'boolean',
        ];
    }

    /**
     * Whether the couple was invited and has not answered yet.
     */
    public function isAwaitingAnswer(): bool
    {
        return $this->requested_at !== null && $this->submitted_at === null;
    }

    /**
     * The wedding this review is about.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
