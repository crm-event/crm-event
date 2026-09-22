<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * Compte d'accès, commun aux deux populations.
 *
 * La table `user` porte les identifiants ; `manager` et `couple` en sont des
 * spécialisations qui partagent la même clé primaire. Les deux guards de
 * l'application s'appuient donc sur les sous-classes Manager et Couple, qui
 * restreignent cette table à leur population respective.
 *
 * Particularités du schéma métier, qui expliquent les surcharges ci-dessous :
 * - le mot de passe est stocké dans `password_hash`, pas `password` ;
 * - la table n'a ni `updated_at` ni `remember_token`.
 *
 * @property int $id
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $city
 * @property string|null $postal_code
 * @property bool $must_change_password
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $last_login_at
 */
#[Fillable(['email', 'phone', 'address', 'city', 'postal_code', 'password_hash'])]
#[Hidden(['password_hash'])]
class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'user';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Le schéma nomme la colonne `password_hash`.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    /**
     * La table `user` n'a pas de colonne `remember_token` : le « se souvenir
     * de moi » est donc inopérant et neutralisé explicitement plutôt que de
     * provoquer une erreur SQL au login.
     */
    public function getRememberToken(): ?string
    {
        return null;
    }

    public function setRememberToken($value): void
    {
        //
    }

    public function getRememberTokenName(): ?string
    {
        return null;
    }
}
