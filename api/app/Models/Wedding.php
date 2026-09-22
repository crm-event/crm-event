<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Un mariage suivi par le back-office.
 *
 * La table `wedding` (schéma métier de l'équipe) n'a pas de colonne
 * `updated_at` : seul `created_at` est géré par Eloquent, d'où
 * `UPDATED_AT = null`.
 *
 * @property int $id
 * @property Carbon $wedding_date
 * @property int|null $guest_count
 * @property string $status
 * @property string|null $memories
 * @property int $couple_id
 * @property int $place_id
 * @property int $design_id
 * @property int|null $reservation_id
 * @property Carbon $created_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'wedding_date',
    'guest_count',
    'status',
    'memories',
    'couple_id',
    'place_id',
    'design_id',
    'reservation_id',
])]
class Wedding extends Model
{
    use SoftDeletes;

    protected $table = 'wedding';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'wedding_date' => 'date',
            'guest_count' => 'integer',
            'created_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
