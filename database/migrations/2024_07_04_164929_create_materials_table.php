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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('cod_art')->nullable();
            $table->string('cod_prod')->nullable();
            $table->string('name_prod')->nullable();
            $table->longText('desc')->nullable();
            $table->string('um')->nullable();
            $table->decimal('priece')->nullable();
            $table->integer('iva')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
