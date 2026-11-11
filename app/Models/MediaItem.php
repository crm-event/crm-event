<?php

namespace App\Models;

use Database\Factories\MediaItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Image added to a wedding: an inspiration photo (`images` collection) or the
 * couple's moodboard (`moodboards` collection, the latest one is displayed).
 */
class MediaItem extends Model
{
    /** @use HasFactory<MediaItemFactory> */
    use HasFactory;

    public const INSPIRATIONS = 'images';

    public const MOODBOARDS = 'moodboards';

    protected $fillable = [
        'wedding_id',
        'uploaded_by',
        'collection',
        'title',
        'alt_text',
        'file_path',
        'mime_type',
        'size_bytes',
    ];

    /**
     * The wedding this image belongs to.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
