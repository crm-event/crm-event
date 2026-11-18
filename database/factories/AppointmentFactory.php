<?php

namespace Database\Factories;

use App\Enums\AppointmentMode;
use App\Enums\AppointmentType;
use App\Models\Appointment;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state: an upcoming video appointment.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'type' => AppointmentType::Milestone,
            'title' => fake()->sentence(3),
            'starts_at' => fake()->dateTimeBetween('+1 week', '+6 months'),
            'mode' => AppointmentMode::Video,
            'location' => null,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the appointment already took place.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => fake()->dateTimeBetween('-6 months', '-1 week'),
        ]);
    }
}
