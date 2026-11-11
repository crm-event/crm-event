<?php

namespace App\Models;

use Database\Factories\TimelineItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model which get the item use to make a timeline for a wedding
 */
class TimelineItem extends Model
{
    /** @use HasFactory<TimelineItemFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'starts_at',
        'title',
        'notes',
        'sort_order'
    ];

     /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'time',
            'sort_order' => 'integer',
        ];
    }

    /**
     * The timeline items that belong to the wedding
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}