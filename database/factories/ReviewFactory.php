<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state: a couple invited to leave a review
     * that has not answered yet.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'requested_at' => now(),
            'rating' => null,
            'would_recommend' => null,
            'body' => null,
            'submitted_at' => null,
        ];
    }
}
