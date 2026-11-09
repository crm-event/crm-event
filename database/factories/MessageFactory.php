<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state: an unread text message, sent by the
     * couple account of the wedding.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'sender_id' => null,
            'body' => fake()->sentence(12),
        ];
    }

    /**
     * Indicate that the message has been read by its recipient.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => now(),
        ]);
    }
}
