<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.  
     */

    //  'name', 'code' , 'material_id' , 'priece' , 'aug', 'iva', 'tot' ,'client' , 'work' , 'task' , 'note'
    public function up(): void
    {
        Schema::create('detail_task_materials', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('material_id')->nullable();
            $table->decimal('priece')->nullable();
            $table->decimal('aug')->nullable();
            $table->integer('iva')->nullable();
            $table->string('client')->nullable();
            $table->string('work')->nullable();
            $table->string('task')->nullable();
            $table->longText('note')->nullable();
            $table->string('status')->nullable();
            $table->string('starting_date')->nullable();
            $table->string('end_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_task_materials');
    }
};
