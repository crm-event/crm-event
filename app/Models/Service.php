<?php

namespace App\Models;

use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Service of Jessica's catalogue (Wedding design, Coordination, Officiante...).
 *
 * The catalogue is editable: a service no longer offered is deactivated
 * (`is_active`) rather than deleted, to keep the history (see
 * docs/bdd/README.md, decision D14).
 */
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * The weddings this service has been sold for (one `wedding_services` row
     * per sale, with its quote and contract, see decision D4).
     *
     * @return BelongsToMany<Wedding, $this>
     */
    public function weddings(): BelongsToMany
    {
        return $this->belongsToMany(Wedding::class, 'wedding_services')->withTimestamps();
    }
}
