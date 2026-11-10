<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weddings', function (Blueprint $table) {
            $table->string('inquiry_stage', 20)->nullable();
            $table->string('legacy_inquiry_id', 100)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('weddings', function (Blueprint $table) {
            $table->dropUnique(['legacy_inquiry_id']);
            $table->dropColumn(['inquiry_stage', 'legacy_inquiry_id']);
        });
    }
};
