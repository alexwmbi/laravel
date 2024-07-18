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
        Schema::create('material_task', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('material_id');
            $table->unsignedBiginteger('task_id');

            $table->foreign('material_id')->references('id')
                ->on('materials')->onDelete('cascade');
            $table->foreign('task_id')->references('id')
                ->on('tasks')->onDelete('cascade');

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_task');
    }
};
