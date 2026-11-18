<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\WeddingService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
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
            'type' => 'deposit',
            'amount' => fake()->randomFloat(2, 100, 3000),
            'due_date' => fake()->dateTimeBetween('now', '+3 months'),
        ];
    }
}
