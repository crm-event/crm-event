<?php

namespace App\Models;

use Database\Factories\ExpenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    /** @use HasFactory<ExpenseFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id', 'expense_category_id', 'spent_on', 'label', 'quantity',
        'amount', 'shop', 'receipt_path', 'billed_to_client_amount',
        'returned_at', 'refunded_amount', 'notes',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'spent_on' => 'date',
            'returned_at' => 'date',
            'quantity' => 'integer',
            'amount' => 'decimal:2',
            'billed_to_client_amount' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /** @return BelongsTo<ExpenseCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
}
