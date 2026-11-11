<?php

namespace Database\Factories;

use App\Models\QuoteAmendment;
use App\Models\WeddingService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteAmendment>
 */
class QuoteAmendmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_service_id' => WeddingService::factory(),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 50, 1500),
        ];
    }
}
