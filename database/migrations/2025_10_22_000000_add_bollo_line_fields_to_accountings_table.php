<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            // Dati della riga "bollo" (da DettaglioLinee)
            $table->unsignedInteger('BolloLineaNumero')->nullable()->after('ImportoTotaleDocumento');
            $table->string('BolloLineaDescrizione')->nullable()->after('BolloLineaNumero');
            $table->decimal('BolloPrezzoUnitario', 15, 8)->nullable()->after('BolloLineaDescrizione');
            $table->decimal('BolloPrezzoTotale', 15, 8)->nullable()->after('BolloPrezzoUnitario');
            $table->decimal('BolloAliquotaIVA', 6, 2)->nullable()->after('BolloPrezzoTotale');
            $table->string('BolloNatura', 10)->nullable()->after('BolloAliquotaIVA');
        });
    }

    public function down(): void
    {
        Schema::table('accountings', function (Blueprint $table) {
            $table->dropColumn([
                'BolloLineaNumero',
                'BolloLineaDescrizione',
                'BolloPrezzoUnitario',
                'BolloPrezzoTotale',
                'BolloAliquotaIVA',
                'BolloNatura',
            ]);
        });
    }
};
