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
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();

            /**
             * Collegamenti principali
             */
            $table->foreignId('work_id')
                ->constrained('works')
                ->cascadeOnDelete();

            $table->foreignId('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            // In futuro: chi ha emesso la fattura (utente gestionale)
            $table->foreignId('issued_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // In caso di nota di credito: fattura originaria
            $table->unsignedBigInteger('original_invoice_id')->nullable();

            /**
             * Identificazione documento
             */
            $table->string('tipo_documento', 4);              // TD01, TD04, ecc.
            $table->string('tipo_vendita', 30);               // STANDARD, REVERSE_CHARGE, NOTA_CREDITO, ecc.

            $table->string('serie', 20)->nullable();          // Es. "FE", "A"
            $table->string('numero', 50);                     // Numero fattura visibile
            $table->unsignedInteger('anno');                  // Anno fiscale, es. 2024

            $table->date('data_documento');
            $table->string('valuta', 3)->default('EUR');
            $table->decimal('cambio', 15, 6)->nullable();     // cambio valuta, se servirà

            /**
             * Dati trasmissione / SDI
             */
            $table->string('formato_trasmissione', 5)->default('FPR12');
            $table->string('progressivo_invio', 20);          // chiave univoca SDI lato mittente

            $table->string('codice_destinatario', 7)->nullable();
            $table->string('pec_destinatario')->nullable();

            // Stato invio SDI
            $table->string('sdi_status', 30)->default('GENERATA');
            // GENERATA, INVIATA, CONSEGNATA, SCARTATA, MANCATA_CONSEGNA, ECC.

            $table->timestamp('sdi_sent_at')->nullable();         // data invio a SDI
            $table->timestamp('sdi_response_at')->nullable();     // data ultima risposta SDI

            $table->string('sdi_message_id', 100)->nullable();    // Identificativo SDI (se vorrai usarlo)
            $table->string('sdi_file_id', 100)->nullable();       // Altro id tecnico SDI, se servirà

            $table->string('sdi_response_code', 50)->nullable();  // Es. codice errore / esito
            $table->text('sdi_response_description')->nullable(); // Descrizione esito/scarto

            /**
             * Importi economici principali
             */
            $table->decimal('imponibile_totale', 15, 2)->default(0);
            $table->decimal('imposta_totale', 15, 2)->default(0);
            $table->decimal('totale_documento', 15, 2)->default(0);

            // Bollo, ritenute, spese accessorie, arrotondamenti, ecc.
            $table->boolean('bollo_applicato')->default(false);
            $table->decimal('bollo_importo', 15, 2)->nullable();

            $table->boolean('has_withholding_tax')->default(false);
            $table->string('withholding_type', 10)->nullable();   // es. RT01, RT02
            $table->decimal('withholding_rate', 5, 2)->nullable();
            $table->decimal('withholding_amount', 15, 2)->nullable();

            $table->decimal('spese_accessorie', 15, 2)->default(0);
            $table->decimal('arrotondamento', 15, 2)->default(0);

            // Totale netto da pagare (se vuoi distinguere)
            $table->decimal('totale_da_pagare', 15, 2)->default(0);

            /**
             * Riepilogo IVA (array per aliquota / natura)
             * [
             *   { "aliquota": 22, "natura": null, "imponibile": 100.00, "imposta": 22.00 },
             *   { "aliquota": 0, "natura": "N6.7", "imponibile": 200.00, "imposta": 0.00 }
             * ]
             */
            $table->json('vat_summary')->nullable();

            /**
             * Riferimenti a fattura collegata (es. nota di credito)
             */
            $table->string('original_invoice_number', 50)->nullable();
            $table->date('original_invoice_date')->nullable();

            /**
             * Dati pagamento
             */
            $table->string('condizioni_pagamento', 10)->nullable();   // Es. TP01, TP02, ecc.
            $table->string('modalita_pagamento', 10)->nullable();     // Es. MP01, MP05, ecc.

            $table->date('data_scadenza_pagamento')->nullable();
            $table->string('iban', 34)->nullable();
            $table->string('istituto_bancario', 255)->nullable();
            $table->string('intestatario_conto', 255)->nullable();

            /**
             * File & percorsi
             */
            $table->string('xml_filename', 255);
            $table->string('xml_path', 500);
            $table->string('xml_hash', 64)->nullable();

            // Se in futuro generi PDF fattura
            $table->string('pdf_filename', 255)->nullable();
            $table->string('pdf_path', 500)->nullable();

            /**
             * Note e metadati
             */
            $table->string('origine', 50)->default('WORK');   // WORK, MANUALE, IMPORT, ecc.
            $table->text('note_interne')->nullable();
            $table->text('note_esterne')->nullable();         // note visibili in fattura

            // Lock fattura (es. quando hai già mandato a SDI / contabilizzato)
            $table->timestamp('locked_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            /**
             * Indici & vincoli
             */
            $table->foreign('original_invoice_id')
                ->references('id')
                ->on('sales_invoices')
                ->nullOnDelete();

            // progressivo invio deve essere unico per P.IVA mittente + anno (semplifichiamo a univoco globale)
            $table->unique('progressivo_invio', 'sales_invoices_progressivo_unique');

            // Numero fattura + serie + anno univoci
            $table->unique(
                ['serie', 'numero', 'anno'],
                'sales_invoices_numero_anno_unique'
            );

            $table->index('data_documento');
            $table->index('sdi_status');
            $table->index('tipo_vendita');
            $table->index('client_id');
            $table->index('work_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropForeign(['work_id']);
            $table->dropForeign(['client_id']);
            $table->dropForeign(['issued_by_user_id']);
            $table->dropForeign(['original_invoice_id']);
        });

        Schema::dropIfExists('sales_invoices');
    }
};
