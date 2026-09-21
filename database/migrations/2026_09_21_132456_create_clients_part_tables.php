
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * COUPLE_SPACE
         */
        Schema::create('COUPLE_SPACE', function (Blueprint $table) {
            $table->increments('couple_space_id');

            $table->string('display_name', 150);
            $table->dateTime('last_opened_at')->nullable();
            $table->string('wedding_status', 50)->default('en_cours');
        });

        /*
         * MESSAGE
         */
        Schema::create('MESSAGE', function (Blueprint $table) {
            $table->increments('message_id');

            $table->text('body')->nullable();
            $table->string('voice_file', 255)->nullable();

            $table->unsignedInteger('sent_by');
            $table->unsignedInteger('sent_to')->nullable();
            $table->unsignedInteger('couple_space_id');

            $table->dateTime('sent_at')->useCurrent();
            $table->dateTime('read_at')->nullable();

            $table->foreign('sent_by')
                ->references('id')
                ->on('USER');

            $table->foreign('sent_to')
                ->references('id')
                ->on('USER');

            $table->foreign('couple_space_id')
                ->references('couple_space_id')
                ->on('COUPLE_SPACE')
                ->onDelete('cascade');

            $table->index(
                ['couple_space_id', 'sent_at'],
                'idx_message_space_date'
            );
        });

        /*
         * PORTAL_DOCUMENT
         */
        Schema::create('PORTAL_DOCUMENT', function (Blueprint $table) {
            $table->increments('document_id');

            $table->string('category', 100)->nullable();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('file_name', 255);

            $table->boolean('needs_approved')->default(false);
            $table->dateTime('deposited_at')->useCurrent();

            $table->unsignedInteger('deposited_by');
            $table->unsignedInteger('couple_space_id');

            $table->foreign('deposited_by')
                ->references('id')
                ->on('USER');

            $table->foreign('couple_space_id')
                ->references('couple_space_id')
                ->on('COUPLE_SPACE')
                ->onDelete('cascade');

            $table->index('couple_space_id', 'idx_document_space');
        });

        /*
         * COMMUNITY_POST
         */
        Schema::create('COMMUNITY_POST', function (Blueprint $table) {
            $table->increments('post_id');

            $table->text('body');
            $table->dateTime('published_at')->useCurrent();

            $table->unsignedInteger('published_by');
            $table->unsignedInteger('parent_post_id')->nullable();

            $table->foreign('published_by')
                ->references('id')
                ->on('USER');

            $table->foreign('parent_post_id')
                ->references('post_id')
                ->on('COMMUNITY_POST')
                ->onDelete('cascade');

            $table->index('parent_post_id', 'idx_post_parent');
        });

        /*
         * FEEDBACK
         */
        Schema::create('FEEDBACK', function (Blueprint $table) {
            $table->increments('feedback_id');

            $table->tinyInteger('rating');
            $table->boolean('would_recommend')->default(true);
            $table->text('comment')->nullable();
            $table->dateTime('submitted_at')->useCurrent();

            $table->unsignedInteger('couple_space_id')->unique();

            $table->foreign('couple_space_id')
                ->references('couple_space_id')
                ->on('COUPLE_SPACE')
                ->onDelete('cascade');
        });

        DB::statement(
            'ALTER TABLE FEEDBACK ADD CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)'
        );

        /*
         * SIGNS_IN_TO
         * Ajout de la clé étrangère dans COUPLE
         */
        Schema::table('COUPLE', function (Blueprint $table) {
            $table->unsignedInteger('couple_space_id')->nullable();

            $table->foreign(
                'couple_space_id',
                'fk_couple_couple_space'
            )
                ->references('couple_space_id')
                ->on('COUPLE_SPACE')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        /*
         * Suppression de la clé étrangère de COUPLE
         */
        Schema::table('COUPLE', function (Blueprint $table) {
            $table->dropForeign('fk_couple_couple_space');
            $table->dropColumn('couple_space_id');
        });

        /*
         * Suppression des tables dans l'ordre inverse des dépendances
         */
        Schema::dropIfExists('FEEDBACK');
        Schema::dropIfExists('COMMUNITY_POST');
        Schema::dropIfExists('PORTAL_DOCUMENT');
        Schema::dropIfExists('MESSAGE');
        Schema::dropIfExists('COUPLE_SPACE');
    }
};
