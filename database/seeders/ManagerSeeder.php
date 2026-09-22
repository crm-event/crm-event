<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\ManagerProfile;
use Illuminate\Database\Seeder;

class ManagerSeeder extends Seeder
{
    /**
     * Compte de démonstration du back-office. Aucune inscription publique :
     * les comptes managers sont créés par seed ou par console.
     */
    public function run(): void
    {
        $manager = Manager::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'manager@crm-event.test'],
            [
                'password_hash' => 'password',
                'must_change_password' => false,
                'is_active' => true,
            ],
        );

        ManagerProfile::firstOrCreate(
            ['id' => $manager->id],
            ['first_name' => 'Jessica', 'last_name' => 'Coordinatrice'],
        );
    }
}
