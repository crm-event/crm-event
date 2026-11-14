<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::table('weddings', function (Blueprint $table) {
            $table->uuid('public_id')->nullable()->unique();
        });

        // Generate UUIDs for existing weddings.
        DB::table('weddings')
            ->select('id')
            ->orderBy('id')
            ->each(function ($wedding) {
                DB::table('weddings')
                    ->where('id', $wedding->id)
                    ->update([
                        'public_id' => (string) Str::uuid(),
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weddings', function (Blueprint $table) {
            $table->dropUnique(['public_id']);
            $table->dropColumn('public_id');
        });
    }
};
