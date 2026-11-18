<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
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
            'expense_category_id' => ExpenseCategory::factory(),
            'spent_on' => fake()->dateTimeBetween('-1 year', 'now'),
            'label' => fake()->words(3, true),
            'quantity' => fake()->numberBetween(1, 5),
            'amount' => fake()->randomFloat(2, 10, 500),
        ];
    }
}
