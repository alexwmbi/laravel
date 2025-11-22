<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesInvoice extends Model
{
    use SoftDeletes;

    protected $table = 'sales_invoices';

    protected $fillable = [
        'work_id',
        'client_id',
        'issued_by_user_id',
        'original_invoice_id',

        'tipo_documento',
        'tipo_vendita',
        'serie',
        'numero',
        'anno',
        'data_documento',
        'valuta',
        'cambio',

        'formato_trasmissione',
        'progressivo_invio',
        'codice_destinatario',
        'pec_destinatario',
        'sdi_status',
        'sdi_sent_at',
        'sdi_response_at',
        'sdi_message_id',
        'sdi_file_id',
        'sdi_response_code',
        'sdi_response_description',

        'imponibile_totale',
        'imposta_totale',
        'totale_documento',

        'bollo_applicato',
        'bollo_importo',

        'has_withholding_tax',
        'withholding_type',
        'withholding_rate',
        'withholding_amount',

        'spese_accessorie',
        'arrotondamento',
        'totale_da_pagare',

        'vat_summary',

        'original_invoice_number',
        'original_invoice_date',

        'condizioni_pagamento',
        'modalita_pagamento',
        'data_scadenza_pagamento',
        'iban',
        'istituto_bancario',
        'intestatario_conto',

        'xml_filename',
        'xml_path',
        'xml_hash',
        'pdf_filename',
        'pdf_path',

        'origine',
        'note_interne',
        'note_esterne',
        'locked_at',
    ];

    protected $casts = [
        'data_documento'          => 'date',
        'original_invoice_date'   => 'date',
        'data_scadenza_pagamento' => 'date',
        'sdi_sent_at'             => 'datetime',
        'sdi_response_at'         => 'datetime',
        'locked_at'               => 'datetime',
        'vat_summary'             => 'array',
        'bollo_applicato'         => 'boolean',
        'has_withholding_tax'     => 'boolean',
    ];

    /**
     * Relazioni
     */
    public function work()
    {
        return $this->belongsTo(Work::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    public function originalInvoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'original_invoice_id');
    }

    public function creditNotes()
    {
        return $this->hasMany(SalesInvoice::class, 'original_invoice_id');
    }

    /**
     * Helpers utili
     */

    public function getNumeroCompletoAttribute(): string
    {
        if ($this->serie) {
            return $this->serie . '-' . $this->numero . '/' . $this->anno;
        }

        return $this->numero . '/' . $this->anno;
    }

    public function isLocked(): bool
    {
        return $this->locked_at !== null;
    }

    public function isCreditNote(): bool
    {
        return $this->tipo_documento === 'TD04';
    }

    public function payments()
    {
        return $this->hasMany(SalesInvoicePayment::class, 'sales_invoice_id');
    }

}
