<?php

namespace Database\Seeders;

use App\Models\Couple;
use App\Models\CoupleProfile;
use Illuminate\Database\Seeder;

class CoupleSeeder extends Seeder
{
    /**
     * Couple de démonstration pour le portail.
     */
    public function run(): void
    {
        $couple = Couple::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'couple@crm-event.test'],
            [
                'password_hash' => 'password',
                'must_change_password' => false,
                'is_active' => true,
            ],
        );

        CoupleProfile::firstOrCreate(
            ['id' => $couple->id],
            [
                'first_name_1' => 'Camille',
                'last_name_1' => 'Martin',
                'first_name_2' => 'Alex',
                'last_name_2' => 'Martin',
                'main_language' => 'fr',
            ],
        );
    }
}
