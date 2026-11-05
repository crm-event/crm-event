<?php

namespace App\Models;

use Database\Factories\CoupleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
     * The weddings of this couple (a couple can come back for a second event).
     *
     * @return HasMany<Wedding, $this>
     */
    public function weddings(): HasMany
    {
        return $this->hasMany(Wedding::class);
    }

    /**
     * The documents of all the weddings of this couple.
     *
     * @return HasManyThrough<Document, Wedding, $this>
     */
    public function documents(): HasManyThrough
    {
        return $this->hasManyThrough(Document::class, Wedding::class);
    }

    /**
     * The appointments of all the weddings of this couple.
     *
     * @return HasManyThrough<Appointment, Wedding, $this>
     */
    public function appointments(): HasManyThrough
    {
        return $this->hasManyThrough(Appointment::class, Wedding::class);
    }

    /**
     * The most recent wedding of this couple, the one new messages are
     * attached to.
     *
     * @return HasOne<Wedding, $this>
     */
    public function latestWedding(): HasOne
    {
        return $this->hasOne(Wedding::class)->latestOfMany();
    }

    /**
     * The private thread with Jessica: the messages of all the weddings of
     * this couple, oldest first. Messages are stored per wedding (`messages`
     * has a `wedding_id`, no `couple_id`).
     *
     * @return HasManyThrough<Message, Wedding, $this>
     */
    public function messages(): HasManyThrough
    {
        return $this->hasManyThrough(Message::class, Wedding::class)->oldest('messages.created_at')->oldest('messages.id');
    }

    /**
     * Title of the thread in Jessica's inbox: "Marie & Paul".
     */
    public function threadTitle(): string
    {
        return collect([$this->partner1_first_name, $this->partner2_first_name])
            ->filter()
            ->join(' & ');
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
}
