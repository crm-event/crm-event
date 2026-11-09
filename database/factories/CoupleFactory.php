<?php

namespace Database\Factories;

use App\Models\Couple;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Couple>
 */
class CoupleFactory extends Factory
{
    /**
     * @return array{partner1_first_name: string, partner1_last_name: string, partner2_first_name: string, partner2_last_name: string, email: string}
     */
    public function definition(): array
    {
        return [
            'partner1_first_name' => fake()->firstName(),
            'partner1_last_name' => fake()->lastName(),
            'partner2_first_name' => fake()->firstName(),
            'partner2_last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
        ];
    }
}
