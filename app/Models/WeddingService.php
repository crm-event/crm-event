<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingService extends Model
{
    protected $fillable = [
        'id',
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

    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}