<?php

namespace Database\Factories;

use App\Models\Couple;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Couple>
 */
class CoupleFactory extends Factory
{
    /**
     * Define the model's default state: a couple record without portal
     * access, as it exists from the first inquiry.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'partner1_first_name' => fake()->firstName(),
            'partner1_last_name' => fake()->lastName(),
            'partner2_first_name' => fake()->firstName(),
            'partner2_last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'postal_code' => fake()->postcode(),
            'city' => fake()->city(),
            'preferred_language' => 'fr',
            'notes' => null,
        ];
    }

    /**
     * Indicate that Jessica has opened the portal access: the record is linked
     * to a user account with the couple role.
     */
    public function withPortalAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => User::factory(),
        ]);
    }
}
