<?php

namespace App\Models;

use Database\Factories\WeddingServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model which get the services (prestations) made for the wedding
 */
class WeddingService extends Model
{
    /** @use HasFactory<WeddingServiceFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'service_id',
        'amount',
        'quote_number',
        'quote_sent_at',
        'quote_valid_until',
        'quote_accepted_at',
        'contract_signed_at',

    ];

    protected $hidden = [
        'vat_rate',
        'security_deposit_amount'
    ];

     /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'quote_number' => 'integer',
            'quote_sent_at'=> 'date',
            'quote_valid_until'=> 'date',
            'quote_accepted_at'=> 'date',
            'contract_signed_at'=> 'date',
        ];
    }

    /**
     * The services held at for the wedding.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /**
     * The types of service held.
     *
     * @return BelongsTo<Service, $this>
     */
    public function service() : BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}