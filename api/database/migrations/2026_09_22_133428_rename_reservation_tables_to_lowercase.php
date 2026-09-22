<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'RESERVATION',
        'HAVE_ACCESS_TO',
    ];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            $this->renameIfNeeded($name, strtolower($name));
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $name) {
            $this->renameIfNeeded(strtolower($name), $name);
        }
    }

    private function getTableNames(): array
    {
        $result = DB::select('SHOW TABLES');

        if (empty($result)) {
            return [];
        }

        $column = 'Tables_in_' . DB::connection()->getDatabaseName();

        return array_map(
            fn ($row) => $row->$column,
            $result
        );
    }

    private function renameIfNeeded(string $from, string $to): void
    {
        $tables = $this->getTableNames();

        // La table source n'existe pas sous ce nom exact.
        if (! in_array($from, $tables, true)) {
            return;
        }

        // Le nom cible existe déjà : ne pas l'écraser.
        if (in_array($to, $tables, true)) {
            return;
        }

        $tmp = $from . '_tmp_rename';

        Schema::rename($from, $tmp);
        Schema::rename($tmp, $to);
    }
};
