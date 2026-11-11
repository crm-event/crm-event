<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Décoration', 'Papeterie', 'Frais déplacement', 'Location'] as $name) {
            ExpenseCategory::query()->firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
