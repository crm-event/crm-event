<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state: a document shared for information,
     * not opened by the couple yet.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'uploaded_by' => null,
            'category' => 'misc',
            'title' => fake()->sentence(3),
            'message' => null,
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => fake()->numberBetween(10_000, 5_000_000),
            'requires_approval' => false,
        ];
    }

    /**
     * Indicate that the couple has opened the document.
     */
    public function viewed(): static
    {
        return $this->state(fn (array $attributes) => [
            'viewed_at' => now(),
        ]);
    }

    /**
     * Indicate that the couple must approve the document with « Lu et
     * approuvé ».
     */
    public function requiringApproval(): static
    {
        return $this->state(fn (array $attributes) => [
            'requires_approval' => true,
        ]);
    }

    /**
     * Indicate that the couple has opened and approved the document.
     */
    public function approved(): static
    {
        return $this->requiringApproval()->viewed()->state(fn (array $attributes) => [
            'approved_at' => now(),
        ]);
    }
}
