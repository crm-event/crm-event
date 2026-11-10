<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * Dated parameter (rate, threshold, delay...), see docs/bdd/README.md,
 * decision D10. A value stays valid until a newer row replaces it.
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'valid_from',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
        ];
    }

    /**
     * Value of a parameter on the given date (today by default): the most
     * recent row whose `valid_from` is not after that date.
     */
    public static function valueOn(string $key, ?CarbonInterface $date = null, ?string $default = null): ?string
    {
        $value = static::query()
            ->where('key', $key)
            ->whereDate('valid_from', '<=', $date ?? today())
            ->orderByDesc('valid_from')
            ->value('value');

        return $value ?? $default;
    }

    /**
     * Number of days after the wedding before the couple is asked for a
     * review (`review_delay_days`, 30 when not set).
     */
    public static function reviewDelayDays(): int
    {
        return (int) static::valueOn('review_delay_days', default: '30');
    }
}
