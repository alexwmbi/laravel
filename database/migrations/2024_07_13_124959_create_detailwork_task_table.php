<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detailwork_task', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('task_id');
            $table->unsignedBiginteger('detailwork_id');
            $table->timestamps();

            $table->foreign('task_id')->references('id')
            ->on('tasks')->onDelete('cascade');
        $table->foreign('detailwork_id')->references('id')
            ->on('detailworks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detailwork_task');
    }
};
