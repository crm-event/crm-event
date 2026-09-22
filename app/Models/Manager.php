<?php

namespace App\Models;

use Database\Factories\ManagerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Compte du back-office (guard "manager").
 *
 * Même table `user` que Couple, mais restreint aux identifiants présents
 * dans `manager`. C'est ce filtre qui rend la séparation structurelle : le
 * provider du guard "manager" ne peut jamais retrouver un couple, et
 * inversement — indépendamment des identifiants fournis.
 */
class Manager extends User
{
    /** @use HasFactory<ManagerFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope('manager', function (Builder $query) {
            $query->whereIn(
                'user.id',
                fn ($sub) => $sub->select('id')->from('manager'),
            );
        });
    }

    public function profile(): HasOne
    {
        return $this->hasOne(ManagerProfile::class, 'id');
    }
}
