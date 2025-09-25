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
        Schema::create('attaches', function (Blueprint $table) {
            $table->id();
            $table->string('fileurl');
            $table->string('work')->nullable();
            $table->string('client')->nullable();
            $table->timestamps();

            $table->foreignId('work_id')->constrained('works')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attaches');
    }
};
