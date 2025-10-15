<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\DetailAccountingStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use App\Casts\PaymentMethodCast;

class DetailAccounting extends Model
{
    use HasFactory;

    protected $fillable = [
        'accountingId',
        'modalitaPagamento',
        'tipoPagamento',
        'dataScadenzaPagamento',
        'importoPagamento',
        'note',
        'stato',
    ];

    protected $casts = [
        'dataScadenzaPagamento' => 'date',
        'importoPagamento'      => 'decimal:2',
        'stato'             => DetailAccountingStatus::class,
        'modalitaPagamento' => PaymentMethodCast::class,
        'tipoPagamento'     => PaymentType::class,
    ];

    public function accounting()
    {
        return $this->belongsTo(Accounting::class, 'accountingId');
    }
}
