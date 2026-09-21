<?php

namespace Database\Seeders;

use App\Models\Coordinator;
use Illuminate\Database\Seeder;

class CoordinatorSeeder extends Seeder
{
    public function run(): void
    {
        Coordinator::factory()->create([
            'name' => 'Coordinatrice',
            'email' => 'coordinatrice@crm-event.test',
            'password' => 'password',
        ]);
    }
}
