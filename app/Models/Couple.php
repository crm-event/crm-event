<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Couple extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'partner1_first_name',
        'partner1_last_name',
        'partner2_first_name',
        'partner2_last_name',
        'email',
        'phone',
        'address',
        'postal_code',
        'city',
        'preferred_language',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
