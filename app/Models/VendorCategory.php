<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Database\Factories\VendorCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * The category for all the vendors (prestatataires)
 */
class VendorCategory extends Model
{
    /** @use HasFactory<VendorCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'photo_path',
        'is_active'
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
     * The vendor associated to the category
     *
     * @return HasMany<Vendor, $this>
     */
    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class, 'vendor_category_id');
    }
}
