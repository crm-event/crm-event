<?php

namespace Database\Seeders;

use App\Models\QuoteAmendment;
use Illuminate\Database\Seeder;

class QuoteAmendmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        QuoteAmendment::factory()->count(3)->create();
    }
}
