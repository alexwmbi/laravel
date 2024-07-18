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
        Schema::create('detailtaskmaterial_material', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('material_id');
            $table->unsignedBiginteger('detailtaskmaterial_id');
            $table->timestamps();

            $table->foreign('material_id')->references('id')
                ->on('materials')->onDelete('cascade');
            $table->foreign('detailtaskmaterial_id')->references('id')
                ->on('detail_task_materials')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detailtaskmaterial_material');
    }
};
