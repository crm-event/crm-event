<?php

namespace App\Models;

use Database\Factories\CoupleFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Compte du portail (guard "couple").
 *
 * Même table `user` que Manager, mais restreint aux identifiants présents
 * dans `couple`. Voir Manager pour le principe.
 */
class Couple extends User
{
    /** @use HasFactory<CoupleFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope('couple', function (Builder $query) {
            $query->whereIn(
                'user.id',
                fn ($sub) => $sub->select('id')->from('couple'),
            );
        });
    }

    public function profile(): HasOne
    {
        return $this->hasOne(CoupleProfile::class, 'id');
    }
}
