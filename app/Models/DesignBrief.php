<?php

namespace App\Models;

use Database\Factories\DesignBriefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Creative brief written by a couple on the Design page: the intention of the
 * wedding, the colours they like and what to avoid. One per wedding.
 */
class DesignBrief extends Model
{
    /** @use HasFactory<DesignBriefFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'title',
        'description',
        'palette',
        'avoid',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'palette' => 'array',
        ];
    }

    /**
     * The wedding this brief is about.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
