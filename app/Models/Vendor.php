<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vendor extends Model
{
    protected $fillable = [
        'id',
        'vendor_category_id',
        'name',
        'contact_name',
        'email',
        'phone',
        'website',
        'notes'
    ];

    public function weddings(): BelongsToMany
    {
        return $this->belongsToMany(
            Wedding::class,
            'wedding_vendor',
            'vendor_id',
            'wedding_id'
        )->withPivot('notes');
    }
}