<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quote_amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_service_id')->constrained()->restrictOnDelete();
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->date('signed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_amendments');
    }
};
