<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarEvent extends Model
{
    use SoftDeletes;

    protected $fillable = ['legacy_id', 'type', 'title', 'event_date', 'event_time', 'location', 'notes'];

    protected function casts(): array
    {
        return ['event_date' => 'date'];
    }
}
