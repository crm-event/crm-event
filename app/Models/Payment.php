<?php

namespace App\Models;

use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_service_id', 'type', 'amount', 'due_date', 'invoice_number',
        'invoice_url', 'invoiced_at', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'due_date' => 'date',
            'invoiced_at' => 'date',
            'paid_at' => 'date',
        ];
    }

    /** @return BelongsTo<WeddingService, $this> */
    public function weddingService(): BelongsTo
    {
        return $this->belongsTo(WeddingService::class);
    }
}
