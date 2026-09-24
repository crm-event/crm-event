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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->restrictOnDelete();
            $table->foreignId('expense_category_id')->constrained()->restrictOnDelete();
            $table->date('spent_on');
            $table->string('label');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('amount', 10, 2);
            $table->string('shop')->nullable();
            $table->string('receipt_path')->nullable();
            $table->decimal('billed_to_client_amount', 10, 2)->nullable();
            $table->date('returned_at')->nullable();
            $table->decimal('refunded_amount', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
