<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_review_delay_is_30_days_by_default(): void
    {
        $this->assertSame(30, Setting::reviewDelayDays());
    }

    public function test_the_review_delay_uses_the_most_recent_value_in_force(): void
    {
        Setting::create(['key' => 'review_delay_days', 'value' => '45', 'valid_from' => now()->subYear()]);
        Setting::create(['key' => 'review_delay_days', 'value' => '60', 'valid_from' => now()->subDay()]);
        Setting::create(['key' => 'review_delay_days', 'value' => '90', 'valid_from' => now()->addYear()]);

        $this->assertSame(60, Setting::reviewDelayDays());
    }
}
