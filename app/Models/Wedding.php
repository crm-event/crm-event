<?php

namespace App\Models;

use Database\Factories\WeddingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
     * The creative brief written by the couple on the Design page.
     *
     * @return HasOne<DesignBrief, $this>
     */
    public function designBrief(): HasOne
    {
        return $this->hasOne(DesignBrief::class);
    }

    /**
     * The inspiration photos and moodboards added for this wedding.
     *
     * @return HasMany<MediaItem, $this>
     */
    public function mediaItems(): HasMany
    {
        return $this->hasMany(MediaItem::class);
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

    /**
     * The services for the wedding
     *
     * @return HasMany<WeddingService, $this>
     */
    public function weddingServices(): HasMany
    {
        return $this->hasMany(WeddingService::class);
    }

    /**
     * The vendor for this wedding.
     *
     * @return BelongsToMany<Vendor, $this>
     */
    public function vendors(): BelongsToMany
    {
        return $this->belongsToMany(
            Vendor::class,
            'wedding_vendor',
            'wedding_id',
            'vendor_id'
        )->withPivot('notes');
    }

    /**
     * The item of the timaline for this wedding.
     *
     * @return HasMany<TimelineItem, $this>
     */
    public function timelineItems(): HasMany
    {
        return $this->hasMany(TimelineItem::class)
        ->orderBy('sort_order');
    }
}
