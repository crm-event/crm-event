<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Dated parameter (delay, rate...): the most recent value already in force
 * is the one that applies (see docs/bdd/README.md, decision D10).
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'valid_from',
    ];

    /**
     * Number of days after the wedding before the couple is asked for a
     * review (`review_delay_days`, 30 when not set).
     */
    public static function reviewDelayDays(): int
    {
        $value = static::query()
            ->where('key', 'review_delay_days')
            ->whereDate('valid_from', '<=', today())
            ->orderByDesc('valid_from')
            ->value('value');

        return $value === null ? 30 : (int) $value;
    }
}
