<?php

namespace App\Models;

use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * Client de la coordinatrice : fiche CRM (côté gestion) et compte du portail
 * (guard "client"). Tant que `password` est null, le client ne peut pas se
 * connecter.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $company
 * @property string|null $phone
 * @property Carbon|null $activated_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'company', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class Client extends Authenticatable
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isActivated(): bool
    {
        return $this->password !== null;
    }
}
