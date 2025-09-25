<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accounting extends Model
{

    use HasFactory;

    //fornitore data numero totale e scadenze
    protected $fillable = [
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
    ];


   public function detailAccounting(){


    return $this->hasMany(DetailAccounting::class, 'accountingId');

    }

}
