<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            
            "Progressivo" => ['string','max:255', 'nullable'],
            "progressivo" => ['string','max:255', 'nullable'],
            "ProgressivoInvio" => ['string','max:255', 'nullable'],
            "FormatoTrasmissione" => ['string','max:255', 'nullable'],
            "FornitoreIdPaese" => ['string','max:255', 'nullable'],
            "FornitoreIdCodice" => ['string','max:255', 'nullable'],
            "FornitoreCodiceFiscale" => ['string','max:255', 'nullable'],
            "FornitoreNome" => ['string','max:255', 'nullable'],
            "FornitoreRegimeFiscale" => ['string','max:255', 'nullable'],

            "FornitoreSedeIndirizzo" => ['string','max:255', 'nullable'],
            "FornitoreSedeCAP" => ['string','max:255', 'nullable'],
            "FornitoreSedeComune" => ['string','max:255', 'nullable'],
            "FornitoreSedeProvincia" => ['string','max:255', 'nullable'],
            "FornitoreSedeNazione" => ['string','max:255', 'nullable'],
            "FornitoreTelefono" => ['string','max:255', 'nullable'],
            "FornitoreEmail" => ['string','max:255', 'nullable'],

            "UfficioRea" => ['string','max:255', 'nullable'],
            "NumeroRea" => ['string','max:255', 'nullable'],
            "CapitaleSocialeRea" => ['string','max:255', 'nullable'],
            "SocioUnicoRea" => ['string','max:255', 'nullable'],
            "StatoLiquidazioneRea" => ['string','max:255', 'nullable'],

            "TipoDocumento" => ['string','max:255', 'nullable'],
            "Divisa" => ['string','max:255', 'nullable'],
            "Data" => ['string','max:255', 'nullable'],
            "Numero" => ['string','max:255', 'nullable'],
            "ImportoTotaleDocumento" => ['string','max:255', 'nullable'],

            "CodiceArticoloTipo1" => ['string','max:255', 'nullable'],
            "CodiceArticoloValore1" => ['string','max:255', 'nullable'],
            "CodiceArticoloTipo2" => ['string','max:255', 'nullable'],
            "CodiceArticoloValore2" => ['string','max:255', 'nullable'],
            "Descrizione" => ['string','max:255', 'nullable'],
            "Quantita" => ['string','max:255', 'nullable'],
            "UnitaMisura" => ['string','max:255', 'nullable'],
            "PrezzoUnitario" => ['string','max:255', 'nullable'],
            "PrezzoTotale" => ['string','max:255', 'nullable'],
            "AliquotaIVA" => ['string','max:255', 'nullable'],

            "RiepilogoAliquotaIVA" => ['string','max:255', 'nullable'],
            "RiepilogoSpeseAccessorie" => ['string','max:255', 'nullable'],
            "RiepilogoImponibileImporto" => ['string','max:255', 'nullable'],
            "RiepilogoImposta" => ['string','max:255', 'nullable'],
            "RiepilogoEsigibilitaIVA" => ['string','max:255', 'nullable'],

            "CondizioniPagamento" => ['string','max:255', 'nullable'],
            "ModalitaPagamento1" => ['string','max:255', 'nullable'],
            "DataScadenzaPagamento1" => ['string','max:255', 'nullable'],
            "ImportoPagamento1" => ['string','max:255', 'nullable'],
            "ModalitaPagamento2" => ['string','max:255', 'nullable'],
            "DataScadenzaPagamento2" => ['string','max:255', 'nullable'],
            "ImportoPagamento2" => ['string','max:255', 'nullable'],
            
            "Stato" => ['string','max:255', 'nullable'],

        ];
    }
}
