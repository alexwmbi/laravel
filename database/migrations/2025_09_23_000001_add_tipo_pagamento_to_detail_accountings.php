<?php
// database/migrations/2025_09_23_000001_add_tipo_pagamento_to_detail_accountings.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('detail_accountings', function (Blueprint $table) {
            // aggiungo la colonna solo se non esiste già (la migrazione fallita potrebbe averla creata)
            if (!Schema::hasColumn('detail_accountings', 'tipoPagamento')) {
                $table->string('tipoPagamento', 30)->nullable()->after('modalitaPagamento');
            }
        });

        // 1) normalizza i valori esistenti di 'stato'
        // mappa eventuali vecchi valori a quelli nuovi
        DB::statement("
            UPDATE detail_accountings
            SET stato = 'pagata'
            WHERE TRIM(LOWER(COALESCE(stato,''))) IN ('archivata','chiusa')
        ");

        // tutto ciò che è NULL/vuoto/non valido -> 'aperta'
        DB::statement("
            UPDATE detail_accountings
            SET stato = 'aperta'
            WHERE stato IS NULL
               OR TRIM(stato) = ''
               OR TRIM(LOWER(stato)) NOT IN ('aperta','pagata','parziale')
        ");

        // 2) ora posso cambiare il tipo a ENUM con default
        Schema::table('detail_accountings', function (Blueprint $table) {
            $table->enum('stato', ['aperta','pagata','parziale'])
                  ->default('aperta')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('detail_accountings', function (Blueprint $table) {
            if (Schema::hasColumn('detail_accountings', 'tipoPagamento')) {
                $table->dropColumn('tipoPagamento');
            }
            // se vuoi davvero ripristinare il tipo, decommenta (richiede doctrine/dbal)
            // $table->string('stato', 20)->nullable()->change();
        });
    }
};
