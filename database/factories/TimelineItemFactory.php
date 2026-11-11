<?php

namespace Database\Factories;

use App\Models\TimelineItem;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimelineItem>
 */
class TimelineItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'starts_at'=> fake()->dateTime(),
            'title' => fake()->sentence(4),
            'notes' => null,
            'sort_order' => fake()->sort()
        ];
    }
}
