<?php
// database/migrations/2025_10_25_000000_add_note_to_accountings_table.php

//  ALTER TABLE `accountings`
//  ADD COLUMN `Note` TEXT NULL AFTER `Stato`;


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            // Manteniamo la convenzione CamelCase già usata (es. Stato, Numero, ...).
            $table->text('Note')->nullable()->after('Stato');
        });
    }

    public function down(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            $table->dropColumn('Note');
        });
    }
};
