<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Partie « couple » d'un compte : table `couple`, dont la clé primaire est
 * aussi la clé étrangère vers `user`.
 *
 * @property int $id
 * @property string|null $first_name_1
 * @property string|null $last_name_1
 * @property string|null $first_name_2
 * @property string|null $last_name_2
 * @property string|null $main_language
 * @property int|null $couple_space_id
 */
#[Fillable([
    'id',
    'first_name_1',
    'last_name_1',
    'first_name_2',
    'last_name_2',
    'main_language',
    'couple_space_id',
])]
class CoupleProfile extends Model
{
    protected $table = 'couple';

    protected $primaryKey = 'id';

    public $incrementing = false;

    public $timestamps = false;
}
