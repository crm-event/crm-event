<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Models for the weddings
 *
 * @property int $id
 * @property int $guest_count
 * @property string $status
 * @property string $memories
 * @property Carbon $wedding_date
 * @property Carbon $created_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['wedding_date','guest_count','status','memories'])]
class Weddings extends Model
{
    use SoftDeletes;
    protected function casts(): array{
        return [
            'created_at' => 'datetime',
            'deleted_at' => 'datetime',
            'wedding_date' => 'datetime',
            'guest_count' => 'integer',
        ];
    }
}
