<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\ManagerProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Manager>
 */
class ManagerFactory extends Factory
{
    protected $model = Manager::class;

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
     * Un compte n'est un manager que s'il a sa ligne dans `manager` : c'est
     * elle qu'exige le global scope du modèle.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Manager $manager) {
            ManagerProfile::create([
                'id' => $manager->id,
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
            ]);
        });
    }
}
