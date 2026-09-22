<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables à renommer
     */
    private array $tables = [
        'USER',
        'MANAGER',
        'COUPLE',
        'COUPLE_SPACE',
        'MESSAGE',
        'PORTAL_DOCUMENT',
        'COMMUNITY_POST',
        'FEEDBACK',
    ];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            $this->rename($name, strtolower($name));
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $name) {
            $this->rename(strtolower($name), $name);
        }
    }

    /**
     * Renomme en passant par un nom temporaire : nécessaire sur un
     * serveur insensible à la casse (Windows/XAMPP, macOS), où
     * renommer "USER" en "user" directement échoue ou ne fait rien.
     */
    private function rename(string $from, string $to): void
    {
        // Garde-fou : sur un SGBD insensible a la casse, les tables creees
        // juste avant portent deja le nom en minuscules et `hasTable($from)`
        // renvoie vrai a tort ou faux selon le serveur. Sans ce test, une
        // installation from scratch peut echouer des la premiere table.
        if (! Schema::hasTable($from)) {
            return;
        }

        $tmp = $from.'_tmp_rename';

        Schema::rename($from, $tmp);
        Schema::rename($tmp, $to);
    }
};
