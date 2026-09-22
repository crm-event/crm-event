<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('RESERVATION_tmp_rename');
        Schema::dropIfExists('HAVE_ACCESS_TO_tmp_rename');
    }

    public function down(): void
    {
        // Les tables supprimées ne sont pas recréées,
        // car cette migration ne sauvegarde pas leurs données.
    }
};
