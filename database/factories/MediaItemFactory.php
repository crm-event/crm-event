<?php

namespace Database\Factories;

use App\Models\MediaItem;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaItem>
 */
class MediaItemFactory extends Factory
{
    /**
     * Define the model's default state: an inspiration photo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'uploaded_by' => null,
            'collection' => MediaItem::INSPIRATIONS,
            'title' => 'inspiration.jpg',
            'alt_text' => 'Photo d’inspiration',
            'file_path' => 'design/'.fake()->uuid().'.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => fake()->numberBetween(10_000, 2_000_000),
        ];
    }

    /**
     * Indicate that the image is the couple's moodboard.
     */
    public function moodboard(): static
    {
        return $this->state(fn (array $attributes) => [
            'collection' => MediaItem::MOODBOARDS,
            'alt_text' => 'Moodboard du mariage',
        ]);
    }
}
