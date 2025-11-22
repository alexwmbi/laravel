<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesInvoicePayment extends Model
{
    protected $table = 'sales_invoice_payments';

    protected $fillable = [
        'sales_invoice_id',
        'stato',
        'modalita_pagamento',
        'tipo_pagamento',
        'data_scadenza_pagamento',
        'importo_pagamento',
        'note',
    ];

    protected $casts = [
        'data_scadenza_pagamento' => 'date',
        'importo_pagamento'       => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'sales_invoice_id');
    }
}
