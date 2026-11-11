<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Wedding;
use App\Models\WeddingService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeddingService>
 */
class WeddingServiceFactory extends Factory
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
            'service_id' => Service::factory(),
            'amount' => fake()->randomFloat(2, 500, 8000),
            'vat_rate' => 0,
        ];
    }
}
