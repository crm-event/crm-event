<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Database\Factories\VendorFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model which get the information of the vendors (prestataires)
 */
class Vendor extends Model
{
    /** @use HasFactory<VendorFactory> */
    use HasFactory;

    protected $fillable = [
        'vendor_category_id',
        'name',
        'contact_name',
        'email',
        'phone',
        'website',
        'notes'
    ];

    /**
     * A vendor can belong to multiple wedding at the same time
     *
     * @return BelongsToMany<Wedding, $this>
     */
    public function weddings(): BelongsToMany
    {
        return $this->belongsToMany(
            Wedding::class,
            'wedding_vendor',
            'vendor_id',
            'wedding_id'
        )->withPivot('notes');
    }

    /**
     * The Vendor belong to a category
     *
     * @return BelongsTo<VendorCategory, $this>
     */
    public function category() : BelongsTo
    {
        return $this->belongsTo(VendorCategory::class, 'vendor_category_id');
    }
}