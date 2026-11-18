<?php

namespace App\Models;

use Database\Factories\ProposalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Design version sent by Jessica to a couple (moodboard, design book,
 * poster…), numbered within its type. Its file is a document of the
 * `design` category, and the couple answers it with comments or approves it
 * (see docs/bdd/README.md).
 */
class Proposal extends Model
{
    /** @use HasFactory<ProposalFactory> */
    use HasFactory;

    /** Type whose revisions are limited by the terms and conditions. */
    public const DESIGN_BOOK = 'design_book';

    /**
     * Kinds of proposals Jessica sends, with their label in the back office.
     *
     * @var array<string, string>
     */
    public const TYPES = [
        'moodboard' => 'Moodboard',
        self::DESIGN_BOOK => 'Carnet design',
        'signage' => 'Affiche / signalétique',
        'stationery' => 'Papeterie',
        'table_plan' => 'Plan de table',
        'other' => 'Autre',
    ];

    public const APPROVED = 'approved';

    public const CHANGES_REQUESTED = 'changes_requested';

    public const AWAITING = 'awaiting';

    protected $fillable = [
        'wedding_id',
        'document_id',
        'type',
        'title',
        'version',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * The wedding this proposal is for.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /**
     * The file of the proposal.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * The conversation about this proposal, oldest first.
     *
     * @return HasMany<ProposalComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ProposalComment::class)->oldest()->oldest('id');
    }

    /**
     * Where the proposal stands: approved by the couple, answered by remarks
     * of the couple (their comment is the last one), or awaiting their answer.
     * Expects the comments and their author to be loaded.
     */
    public function status(): string
    {
        if ($this->approved_at !== null) {
            return self::APPROVED;
        }

        return $this->comments->last()?->isFromCouple() ? self::CHANGES_REQUESTED : self::AWAITING;
    }
}
