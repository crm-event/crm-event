<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected static ?string $password;

    /**
     * Par défaut : client activé (peut se connecter au portail).
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'company' => fake()->company(),
            'phone' => fake()->phoneNumber(),
            'password' => static::$password ??= Hash::make('password'),
            'activated_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Fiche CRM créée par la coordinatrice, compte portail pas encore activé.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => null,
            'activated_at' => null,
            'remember_token' => null,
        ]);
    }
}
