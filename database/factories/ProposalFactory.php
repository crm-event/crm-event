<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Proposal;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Proposal>
 */
class ProposalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wedding_id' => Wedding::factory(),
            'document_id' => fn (array $attributes) => Document::factory()->create([
                'wedding_id' => $attributes['wedding_id'],
                'category' => 'design',
            ])->id,
            'type' => Proposal::DESIGN_BOOK,
            'title' => fake()->sentence(3),
            'version' => 1,
            'description' => fake()->sentence(),
        ];
    }

    /**
     * A proposal the couple has approved.
     */
    public function approved(): static
    {
        return $this->afterMaking(fn (Proposal $proposal) => $proposal->forceFill(['approved_at' => now()]));
    }
}
