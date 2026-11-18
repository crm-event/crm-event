<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\ProposalCommentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Comment written under a design proposal, by the couple (their remarks) or
 * by Jessica (her answer).
 */
class ProposalComment extends Model
{
    /** @use HasFactory<ProposalCommentFactory> */
    use HasFactory;

    public const MAX_BODY_LENGTH = 3000;

    protected $fillable = [
        'proposal_id',
        'user_id',
        'body',
    ];

    /**
     * The proposal this comment is about.
     *
     * @return BelongsTo<Proposal, $this>
     */
    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * The author of the comment (null once a couple has deleted its account).
     *
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Determine whether the couple wrote this comment. A comment whose author
     * deleted their account came from a couple: Jessica's account is never
     * deleted.
     */
    public function isFromCouple(): bool
    {
        return ! $this->author?->hasRole(UserRole::Admin);
    }
}
