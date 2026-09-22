<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;

class Weddings extends Model
{
    public function up() : void{
        Schema::create('weddings', function (Blueprint $table) {
            $table->id();
            $table->date('wedding_date');
            $table->integer('guest_count');
            $table->string('status');
            $table->text('memories')->nullable();
            $table->date('creating_at');
            $table->date('deleted_at')->nullable();
        });
    }
}
