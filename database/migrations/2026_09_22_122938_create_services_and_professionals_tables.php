
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * wedding_service
         */
        Schema::create('wedding_service', function (Blueprint $table) {
            $table->increments('id');

            $table->string('service_type', 100);
            $table->string('label', 200)->nullable();

            $table->decimal('quote_amount_ht', 10, 2)->nullable();
            $table->decimal('vat_rate', 5, 2)->default(20.00);
            $table->string('quote_status', 50)->default('brouillon');
            $table->dateTime('quote_sent_at')->nullable();

            $table->dateTime('contract_signed_at')->nullable();
            $table->string('contract_file_path', 255)->nullable();
            $table->string('signature_proof_path', 255)->nullable();

            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->dateTime('deposit_paid_at')->nullable();
            $table->string('deposit_invoice_number', 50)->nullable();

            $table->decimal('balance_amount', 10, 2)->nullable();
            $table->dateTime('balance_paid_at')->nullable();
            $table->string('balance_invoice_number', 50)->nullable();

            $table->unsignedBigInteger('wedding_id');

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('cascade');

            $table->index('wedding_id', 'idx_service_wedding');
        });

        /*
         * quote_amendment
         */
        Schema::create('quote_amendment', function (Blueprint $table) {
            $table->increments('id');

            $table->decimal('previous_amount', 10, 2)->nullable();
            $table->decimal('new_amount', 10, 2)->nullable();
            $table->text('reason')->nullable();
            $table->dateTime('signed_at')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->unsignedInteger('wedding_service_id');

            $table->foreign('wedding_service_id')
                ->references('id')
                ->on('wedding_service')
                ->onDelete('cascade');
        });

        /*
         * profession
         */
        Schema::create('profession', function (Blueprint $table) {
            $table->increments('id');

            $table->string('name', 150);
            $table->string('photo_placeholder', 255)->nullable();
        });

        /*
         * professional
         */
        Schema::create('professional', function (Blueprint $table) {
            $table->increments('id');

            $table->string('name', 100);
            $table->string('firstname', 100)->nullable();
            $table->string('email', 255)->nullable();
        });

        /*
         * which_is
         */
        Schema::create('which_is', function (Blueprint $table) {
            $table->unsignedInteger('professional_id');
            $table->unsignedInteger('profession_id');

            $table->primary(['professional_id', 'profession_id']);

            $table->foreign('professional_id')
                ->references('id')
                ->on('professional')
                ->onDelete('cascade');

            $table->foreign('profession_id')
                ->references('id')
                ->on('profession')
                ->onDelete('cascade');
        });

        /*
         * performance
         */
        Schema::create('performance', function (Blueprint $table) {
            $table->increments('id');

            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();

            $table->unsignedInteger('professional_id');

            $table->foreign('professional_id')
                ->references('id')
                ->on('professional');
        });

        /*
         * composed_of
         */
        Schema::create('composed_of', function (Blueprint $table) {
            $table->unsignedBigInteger('wedding_id');
            $table->unsignedInteger('performance_id');

            $table->primary(['wedding_id', 'performance_id']);

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('cascade');

            $table->foreign('performance_id')
                ->references('id')
                ->on('performance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composed_of');
        Schema::dropIfExists('performance');
        Schema::dropIfExists('which_is');
        Schema::dropIfExists('professional');
        Schema::dropIfExists('profession');
        Schema::dropIfExists('quote_amendment');
        Schema::dropIfExists('wedding_service');
    }
};
