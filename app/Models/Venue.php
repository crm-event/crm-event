<?php

namespace App\Models;

use Database\Factories\VenueFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Place where a wedding is held.
 */
class Venue extends Model
{
    /** @use HasFactory<VenueFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'postal_code',
        'city',
        'travel_time_minutes',
        'access_notes',
        'conditions',
        'contact_name',
        'contact_phone',
        'contact_email',
    ];

    /**
     * The weddings held at this venue.
     *
     * @return HasMany<Wedding, $this>
     */
    public function weddings(): HasMany
    {
        return $this->hasMany(Wedding::class);
    }
}
