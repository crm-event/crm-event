<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Jeu de données commun à l'équipe : `php artisan migrate:fresh --seed`
     * doit donner exactement la même base à tout le monde.
     */
    public function run(): void
    {
        $this->call([
            ManagerSeeder::class,
            CoupleSeeder::class,
        ]);
    }
}
