<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailAccounting extends Model
{
    use HasFactory;

    //protected $fillable = ['accountingId', 'stato','modalitaPagamento','dataScadenzaPagamento','importoPagamento','note'];
    protected $fillable = [
        'accountingId',
        'modalitaPagamento',
        'tipoPagamento',
        'dataScadenzaPagamento',
        'importoPagamento',
        'note',
        'stato'
    ];

    protected $casts = [
        'dataScadenzaPagamento' => 'date',
        'importoPagamento'      => 'decimal:2',
    ];

    public function accounting()
    {
        return $this->belongsTo(Accounting::class, 'accountingId');
    }
}
