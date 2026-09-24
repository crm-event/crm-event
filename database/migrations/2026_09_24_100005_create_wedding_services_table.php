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
        Schema::create('wedding_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 10, 2)->nullable();
            $table->decimal('vat_rate', 5, 2)->default(0);
            $table->string('quote_number')->nullable()->unique();
            $table->date('quote_sent_at')->nullable();
            $table->date('quote_valid_until')->nullable();
            $table->date('quote_accepted_at')->nullable();
            $table->date('contract_signed_at')->nullable();
            $table->decimal('security_deposit_amount', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wedding_services');
    }
};
