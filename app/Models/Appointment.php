<?php

namespace App\Models;

use App\Enums\AppointmentMode;
use App\Enums\AppointmentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['wedding_id', 'type', 'title', 'starts_at', 'mode', 'location', 'notes'])]
class Appointment extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AppointmentType::class,
            'mode' => AppointmentMode::class,
            'starts_at' => 'datetime',
        ];
    }

    /**
     * The wedding this appointment belongs to.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
