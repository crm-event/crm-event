
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * expense
         */
        Schema::create('expense', function (Blueprint $table) {
            $table->increments('id');

            $table->string('label', 200);
            $table->integer('quantity')->default(1);
            $table->decimal('amount', 10, 2);
            $table->decimal('vat_rate', 5, 2)->default(20.00);

            $table->string('shop', 150)->nullable();
            $table->date('expense_date')->nullable();
            $table->string('receipt_path', 255)->nullable();
            $table->text('comment')->nullable();

            $table->dateTime('returned_at')->nullable();
            $table->decimal('refunded_amount', 10, 2)->nullable();
            $table->decimal('billed_to_client_amount', 10, 2)->nullable();

            $table->unsignedBigInteger('wedding_id')->nullable();

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('set null');

            $table->index('wedding_id', 'idx_expense_wedding');
        });

        /*
         * expense_category
         */
        Schema::create('expense_category', function (Blueprint $table) {
            $table->increments('id');

            $table->string('name', 150);
            $table->boolean('is_active')->default(true);
        });

        /*
         * is_classified
         */
        Schema::create('is_classified', function (Blueprint $table) {
            $table->unsignedInteger('expense_id');
            $table->unsignedInteger('expense_category_id');

            $table->primary(['expense_id', 'expense_category_id']);

            $table->foreign('expense_id')
                ->references('id')
                ->on('expense')
                ->onDelete('cascade');

            $table->foreign('expense_category_id')
                ->references('id')
                ->on('expense_category')
                ->onDelete('cascade');
        });

        /*
         * time_category
         */
        Schema::create('time_category', function (Blueprint $table) {
            $table->increments('id');

            $table->string('name', 150);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
        });

        /*
         * time_entry
         */
        Schema::create('time_entry', function (Blueprint $table) {
            $table->increments('id');

            $table->date('entry_date');
            $table->decimal('time', 5, 2);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->string('task_label', 200)->nullable();
            $table->text('comment')->nullable();

            $table->unsignedBigInteger('wedding_id');
            $table->unsignedInteger('time_category_id');

            $table->foreign('wedding_id')
                ->references('id')
                ->on('wedding')
                ->onDelete('cascade');

            $table->foreign('time_category_id')
                ->references('id')
                ->on('time_category');

            $table->index(
                ['wedding_id', 'entry_date'],
                'idx_time_entry_wedding'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_entry');
        Schema::dropIfExists('time_category');
        Schema::dropIfExists('is_classified');
        Schema::dropIfExists('expense_category');
        Schema::dropIfExists('expense');
    }
};
