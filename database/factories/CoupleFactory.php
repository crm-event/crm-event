<?php

namespace Database\Factories;

use App\Models\Couple;
use App\Models\CoupleProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Couple>
 */
class CoupleFactory extends Factory
{
    protected $model = Couple::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('0#########'),
            'password_hash' => 'password',
            'must_change_password' => false,
            'is_active' => true,
        ];
    }

    /**
     * Un compte n'est un couple que s'il a sa ligne dans `couple`.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Couple $couple) {
            CoupleProfile::create([
                'id' => $couple->id,
                'first_name_1' => fake()->firstName(),
                'last_name_1' => fake()->lastName(),
                'first_name_2' => fake()->firstName(),
                'last_name_2' => fake()->lastName(),
                'main_language' => 'fr',
            ]);
        });
    }
}
