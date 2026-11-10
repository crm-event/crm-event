<?php

namespace Database\Factories;

use App\Models\DesignBrief;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DesignBrief>
 */
class DesignBriefFactory extends Factory
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
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'palette' => ['Ivoire', 'Vert sauge'],
            'avoid' => fake()->sentence(),
        ];
    }
}
