<?php

namespace App\Models;

use App\Casts\AccountingStatusCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accounting extends Model
{
    use HasFactory;

    /**
     * Attributi assegnabili in massa.
     */
    protected $fillable = [
        'Progressivo',
        'ProgressivoInvio',
        'FormatoTrasmissione',
        'FornitoreIdPaese',
        'FornitoreIdCodice',
        'FornitoreCodiceFiscale',
        'FornitoreNome',
        'FornitoreRegimeFiscale',
        'FornitoreSedeIndirizzo',
        'FornitoreSedeCAP',
        'FornitoreSedeComune',
        'FornitoreSedeProvincia',
        'FornitoreSedeNazione',
        'FornitoreTelefono',
        'FornitoreEmail',
        'UfficioRea',
        'NumeroRea',
        'CapitaleSocialeRea',
        'SocioUnicoRea',
        'StatoLiquidazioneRea',
        'TipoDocumento',
        'Divisa',
        'Data',
        'Numero',
        'ImportoTotaleDocumento',
        'CodiceArticoloTipo1',
        'CodiceArticoloValore1',
        'CodiceArticoloTipo2',
        'CodiceArticoloValore2',
        'Descrizione',
        'Quantita',
        'UnitaMisura',
        'PrezzoUnitario',
        'PrezzoTotale',
        'AliquotaIVA',
        'RiepilogoAliquotaIVA',
        'RiepilogoSpeseAccessorie',
        'RiepilogoImponibileImporto',
        'RiepilogoImposta',
        'RiepilogoEsigibilitaIVA',
        'CondizioniPagamento',
        'ModalitaPagamento1',
        'DataScadenzaPagamento1',
        'ImportoPagamento1',
        'ModalitaPagamento2',
        'DataScadenzaPagamento2',
        'ImportoPagamento2',
        'Stato',
        'xml_originale',
        'imported_at',
        'BolloLineaNumero',
        'BolloLineaDescrizione',
        'BolloPrezzoUnitario',
        'BolloPrezzoTotale',
        'BolloAliquotaIVA',
        'BolloNatura',
        'Note',

    ];

    /**
     * Cast degli attributi.
     * Usa un cast personalizzato che normalizza maiuscole/minuscole
     * in lettura/scrittura per il campo "Stato".
     */
    protected $casts = [
        'Stato' => AccountingStatusCast::class,
    ];

    /**
     * Relazione: una fattura ha molte righe di pagamento.
     */
    public function detailAccounting()
    {
        return $this->hasMany(DetailAccounting::class, 'accountingId');
    }
}
