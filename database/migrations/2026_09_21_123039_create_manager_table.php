
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('MANAGER', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();

            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();

            $table->foreign('id')
                ->references('id')
                ->on('USER');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('MANAGER');
    }
};
