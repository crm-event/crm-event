<?php

namespace App\Models;

use Database\Factories\QuoteAmendmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteAmendment extends Model
{
    /** @use HasFactory<QuoteAmendmentFactory> */
    use HasFactory;

    protected $fillable = ['wedding_service_id', 'description', 'amount', 'signed_at'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'signed_at' => 'date'];
    }

    /** @return BelongsTo<WeddingService, $this> */
    public function weddingService(): BelongsTo
    {
        return $this->belongsTo(WeddingService::class);
    }
}
