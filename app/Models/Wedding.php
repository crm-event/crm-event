<?php

namespace App\Models;

use Database\Factories\WeddingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Wedding project of a couple, created at the first contact.
 *
 * The same row is the inquiry and the wedding: its `status` moves from
 * `inquiry` to `closed`, or to `cancelled` (see docs/bdd/README.md, decisions
 * D3 and D5).
 */
class Wedding extends Model
{
    /** @use HasFactory<WeddingFactory> */
    use HasFactory;

    protected $fillable = [
        'couple_id',
        'venue_id',
        'status',
        'wedding_date',
        'first_contact_at',
        'lead_source',
        'guest_count',
        'estimated_budget',
        'cancellation_reason',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'wedding_date' => 'date',
            'first_contact_at' => 'date',
            'guest_count' => 'integer',
            'estimated_budget' => 'decimal:2',
        ];
    }

    /**
     * The couple this wedding belongs to.
     *
     * @return BelongsTo<Couple, $this>
     */
    public function couple(): BelongsTo
    {
        return $this->belongsTo(Couple::class);
    }

    /**
     * The venue of the wedding, null while it is not known yet.
     *
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * The services sold for this wedding (wedding design, coordination,
     * officiant...), through `wedding_services`.
     *
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'wedding_services')->withTimestamps();
    }

    /**
     * The documents shared in the couple space for this wedding.
     *
     * @return HasMany<Document, $this>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * The appointments scheduled for this wedding.
     *
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * The private messages exchanged with Jessica about this wedding.
     *
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
