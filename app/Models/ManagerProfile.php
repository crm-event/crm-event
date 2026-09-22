<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Partie « manager » d'un compte : table `manager`, dont la clé primaire est
 * aussi la clé étrangère vers `user`.
 *
 * @property int $id
 * @property string|null $first_name
 * @property string|null $last_name
 */
#[Fillable(['id', 'first_name', 'last_name'])]
class ManagerProfile extends Model
{
    protected $table = 'manager';

    protected $primaryKey = 'id';

    public $incrementing = false;

    public $timestamps = false;
}
