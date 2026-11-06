<?php

namespace Database\Factories;

use App\Models\Couple;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wedding>
 */
class WeddingFactory extends Factory
{
    /**
     * Define the model's default state: a booked wedding of a new couple.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'couple_id' => Couple::factory(),
            'venue_id' => null,
            'status' => 'booked',
            'wedding_date' => fake()->dateTimeBetween('+6 months', '+2 years'),
            'first_contact_at' => null,
            'lead_source' => null,
            'guest_count' => null,
            'estimated_budget' => null,
            'cancellation_reason' => null,
            'notes' => null,
        ];
    }
}
