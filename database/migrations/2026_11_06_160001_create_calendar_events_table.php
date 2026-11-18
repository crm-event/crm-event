<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('legacy_id', 100)->nullable()->unique();
            $table->string('type', 20);
            $table->string('title', 120);
            $table->date('event_date')->index();
            $table->time('event_time')->nullable();
            $table->string('location', 160)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
