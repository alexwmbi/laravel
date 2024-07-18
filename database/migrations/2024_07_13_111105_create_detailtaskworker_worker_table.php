<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detailtaskworker_worker', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('worker_id');
            $table->unsignedBiginteger('detailtaskworker_id');
            $table->timestamps();

            $table->foreign('worker_id')->references('id')
                ->on('workers')->onDelete('cascade');
            $table->foreign('detailtaskworker_id')->references('id')
                ->on('detail_task_workers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detailtaskworker_worker');
    }
};
