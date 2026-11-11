<?php

namespace Database\Factories;

use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vendor_category_id' => VendorCategory::factory(),
            'name' => fake()->name,
            'contact_name' => fake()->sentence(4),
            'email' => fake()->email(),
            'phone' => fake()->phoneNumber(),
            'website' => null,
            'notes' => null
        ];
    }
}
