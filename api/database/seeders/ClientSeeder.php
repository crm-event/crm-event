<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        // Un client activé pour tester le portail...
        Client::factory()->create([
            'name' => 'Client Démo',
            'email' => 'client@crm-event.test',
            'company' => 'Démo SARL',
            'password' => 'password',
        ]);

        // ...et quelques fiches en attente d'activation pour le back-office.
        Client::factory()->count(5)->pending()->create();
    }
}
