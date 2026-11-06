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
     * Define the model's default state: a new inquiry, as it exists from the
     * first contact.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'couple_id' => Couple::factory(),
            'venue_id' => null,
            'status' => 'inquiry',
            'wedding_date' => fake()->dateTimeBetween('+6 months', '+2 years'),
            'first_contact_at' => fake()->dateTimeBetween('-6 months'),
            'lead_source' => fake()->randomElement(['Site', 'Insta', 'Bouche-à-oreille']),
            'guest_count' => fake()->numberBetween(30, 200),
            'estimated_budget' => fake()->randomFloat(2, 5000, 40000),
            'cancellation_reason' => null,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the contract has been signed.
     */
    public function booked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'booked',
        ]);
    }
}
