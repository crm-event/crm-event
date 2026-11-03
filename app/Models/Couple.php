<?php

namespace App\Models;

use Database\Factories\CoupleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Client record of a couple, created from the first inquiry.
 *
 * It is distinct from the login account: `user_id` stays null until Jessica
 * opens the portal access (see docs/bdd/README.md, decision D2).
 */
class Couple extends Model
{
    /** @use HasFactory<CoupleFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'partner1_first_name',
        'partner1_last_name',
        'partner2_first_name',
        'partner2_last_name',
        'email',
        'phone',
        'address',
        'postal_code',
        'city',
        'preferred_language',
        'notes',
    ];

    /**
     * The login account of the couple, null while the portal access is not
     * open.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * First names of the partners, as shown to the other couples:
     * "Marie et Paul", or "Marie" when only one first name is known.
     */
    public function firstNames(): string
    {
        return collect([$this->partner1_first_name, $this->partner2_first_name])
            ->filter()
            ->join(' et ');
    }

    /**
     * The weddings of the couple.
     *
     * @return HasMany<Wedding, $this>
     */
    public function weddings(): HasMany
    {
        return $this->hasMany(Wedding::class);
    }
}
