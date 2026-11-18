<?php

namespace Database\Seeders;

use App\Models\WeddingService;
use Illuminate\Database\Seeder;

class WeddingServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WeddingService::factory()->count(5)->create();
    }
}
