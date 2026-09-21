<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Clients de la coordinatrice. Un client est d'abord une fiche CRM créée
     * côté gestion ; il obtient l'accès au portail en définissant son mot de
     * passe via un lien d'activation (même mécanisme que le reset).
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('company')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('password')->nullable(); // null tant que le compte n'est pas activé
            $table->timestamp('activated_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('client_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_password_reset_tokens');
        Schema::dropIfExists('clients');
    }
};
