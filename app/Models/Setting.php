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
        return (int) (static::currentValue('review_delay_days') ?? 30);
    }

    /**
     * Number of revisions of the design book included in the price
     * (`max_design_revisions`, 3 when not set, as in the terms and
     * conditions).
     */
    public static function maxDesignRevisions(): int
    {
        return (int) (static::currentValue('max_design_revisions') ?? 3);
    }

    /**
     * The value of a parameter in force today, or null when it is not set.
     */
    private static function currentValue(string $key): ?string
    {
        return static::query()
            ->where('key', $key)
            ->whereDate('valid_from', '<=', today())
            ->orderByDesc('valid_from')
            ->value('value');
    }
}
