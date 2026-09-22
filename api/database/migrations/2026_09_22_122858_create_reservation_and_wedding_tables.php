
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * reservation
         */
        Schema::create('reservation', function (Blueprint $table) {
            $table->increments('id');

            $table->string('status', 50)->default('nouvelle');
            $table->string('lost_reason', 255)->nullable();

            $table->boolean('wants_decoration')->default(false);
            $table->boolean('wants_coordination')->default(false);
            $table->boolean('wants_officiant')->default(false);

            $table->string('couple_name', 200)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->date('requested_date')->nullable();
            $table->string('venue_text', 255)->nullable();
            $table->integer('guest_count')->nullable();
            $table->string('source', 100)->nullable();

            $table->dateTime('created_at')->useCurrent();
        });

        /*
         * have_access_to
         */
        Schema::create('have_access_to', function (Blueprint $table) {
            $table->unsignedInteger('manager_id');
            $table->unsignedInteger('reservation_id');
            $table->dateTime('granted_at')->useCurrent();

            $table->primary(['manager_id', 'reservation_id']);

            $table->foreign('manager_id')
                ->references('id')
                ->on('manager')
                ->onDelete('cascade');

            $table->foreign('reservation_id')
                ->references('id')
                ->on('reservation')
                ->onDelete('cascade');
        });

        /*
         * todo_list
         */
        Schema::create('todo_list', function (Blueprint $table) {
            $table->increments('id');

            $table->string('title', 200);
            $table->date('due_date')->nullable();
            $table->boolean('is_done')->default(false);
            $table->dateTime('done_at')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->unsignedInteger('manager_id');

            $table->foreign('manager_id')
                ->references('id')
                ->on('manager')
                ->onDelete('cascade');
        });

        /*
         * place
         */
        Schema::create('place', function (Blueprint $table) {
            $table->increments('id');

            $table->string('name', 200);
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('contact_name', 150)->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('access_type', 100)->nullable();
            $table->text('additional_infos')->nullable();
        });

        /*
         * design
         */
        Schema::create('design', function (Blueprint $table) {
            $table->increments('id');

            $table->text('table_plan')->nullable();
            $table->text('decor')->nullable();
            $table->text('stationery')->nullable();
            $table->text('additional_instructions')->nullable();

            $table->dateTime('updated_at')
                ->useCurrent()
                ->useCurrentOnUpdate();
        });

        /*
         * wedding
         */
        Schema::create('wedding', function (Blueprint $table) {
            $table->increments('id');

            $table->date('wedding_date');
            $table->integer('guest_count')->nullable();
            $table->string('status', 50)->default('en_preparation');
            $table->text('memories')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('deleted_at')->nullable();

            $table->unsignedInteger('couple_id');
            $table->unsignedInteger('place_id');
            $table->unsignedInteger('design_id');
            $table->unsignedInteger('reservation_id')->nullable()->unique();

            $table->foreign('couple_id')
                ->references('id')
                ->on('couple');

            $table->foreign('place_id')
                ->references('id')
                ->on('place');

            $table->foreign('design_id')
                ->references('id')
                ->on('design');

            $table->foreign('reservation_id')
                ->references('id')
                ->on('reservation')
                ->onDelete('set null');

            $table->index('wedding_date', 'idx_wedding_date');
            $table->index('couple_id', 'idx_wedding_couple');
        });

        /*
         * timeline
         */
        Schema::create('timeline', function (Blueprint $table) {
            $table->increments('id');

            $table->time('start_time')->nullable();
            $table->string('title', 200);
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->unsignedInteger('wedding_id');

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('cascade');

            $table->index(
                ['wedding_id', 'sort_order'],
                'idx_timeline_wedding'
            );
        });

        /*
         * feedback_form
         */
        Schema::create('feedback_form', function (Blueprint $table) {
            $table->increments('id');

            $table->text('review_question')->nullable();
            $table->text('review_answers')->nullable();
            $table->unsignedInteger('wedding_id')->unique();

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_form');
        Schema::dropIfExists('timeline');
        Schema::dropIfExists('wedding');
        Schema::dropIfExists('design');
        Schema::dropIfExists('place');
        Schema::dropIfExists('todo_list');
        Schema::dropIfExists('have_access_to');
        Schema::dropIfExists('reservation');
    }
};
