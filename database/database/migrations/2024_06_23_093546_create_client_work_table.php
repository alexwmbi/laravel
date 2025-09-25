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
        Schema::create('client_work', function (Blueprint $table) {
            $table->id();
            $table->unsignedBiginteger('client_id');
            $table->unsignedBiginteger('work_id');

            $table->timestamps();

            $table->foreign('client_id')->references('id')
                 ->on('clients')->onDelete('cascade');
            $table->foreign('work_id')->references('id')
                ->on('works')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_work');
    }
};
