<?php

namespace App\Models;

use Database\Factories\WeddingServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A service sold for a wedding, with its quote and contract information.
 */
class WeddingService extends Model
{
    /** @use HasFactory<WeddingServiceFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id', 'service_id', 'amount', 'vat_rate', 'quote_number',
        'quote_sent_at', 'quote_valid_until', 'quote_accepted_at',
        'contract_signed_at', 'security_deposit_amount',
    ];

    protected $hidden = ['vat_rate', 'security_deposit_amount'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'security_deposit_amount' => 'decimal:2',
            'quote_sent_at' => 'date',
            'quote_valid_until' => 'date',
            'quote_accepted_at' => 'date',
            'contract_signed_at' => 'date',
        ];
    }

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /** @return BelongsTo<Service, $this> */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** @return HasMany<QuoteAmendment, $this> */
    public function amendments(): HasMany
    {
        return $this->hasMany(QuoteAmendment::class);
    }
}
