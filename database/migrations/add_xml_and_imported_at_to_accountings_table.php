<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            $table->longText('xml_originale')->nullable()->after('Stato');
            $table->timestamp('imported_at')->nullable()->after('xml_originale');
        });
    }

    public function down(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            $table->dropColumn(['xml_originale', 'imported_at']);
        });
    }
};
