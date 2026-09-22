
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('USER', function (Blueprint $table) {
            $table->increments('id');

            $table->string('email', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('password_hash', 255)->nullable();

            $table->boolean('must_change_password')->default(false);

            $table->dateTime('created_at')->nullable();
            $table->dateTime('last_login_at')->nullable();

            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('USER');
    }
};
