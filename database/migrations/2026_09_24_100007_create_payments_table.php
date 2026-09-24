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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_service_id')->constrained()->restrictOnDelete();
            $table->string('type');
            $table->decimal('amount', 10, 2);
            $table->date('due_date')->nullable();
            $table->string('invoice_number')->nullable()->unique();
            $table->string('invoice_url', 2048)->nullable();
            $table->date('invoiced_at')->nullable();
            $table->date('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
