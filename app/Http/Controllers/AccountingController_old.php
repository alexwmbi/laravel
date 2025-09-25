<?php

namespace App\Http\Controllers;

use App\Http\Resources\AccountingResource;
use App\Models\Accounting;
use App\Http\Requests\StoreAccountingRequest;
use App\Http\Requests\UpdateAccountingRequest;
use App\Models\DetailAccounting;
use DB;

class AccountingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //dd("prova");


        $query = Accounting::query()->with('detailAccounting');
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');


        //PROGRESSIVO	FORNITORE	DATA	NUMERO

        if (request("stato")) {

            $query->where("Stato", request("stato"));
        }

        if (request("progressivo")) {
            request()->query->remove('page');
            $query->where("Progressivo", "like", "%" . request("progressivo") . "%");
        }

        if (request("progressivoinvio")) {
            request()->query->remove('page');
            $query->where("ProgressivoInvio", "like", "%" . request("progressivoinvio") . "%");
        }

        if (request("nome")) {
            request()->query->remove('page');
            $query->where("FornitoreNome", "like", "%" . request("nome") . "%");
        }

        if (request("numero")) {
            request()->query->remove('page');
            $query->where("Numero", "like", "%" . request("numero") . "%");
        }




        //Ricerca cliente
        /*  if (request("name")) {
             request()->query->remove('page');        
             $query->where("name", "like", "%" . request("name") . "%");
         }

         if (request("note")) {
             request()->query->remove('page');    
             $query->where("note", "like", "%" . request("note") . "%")->orWhere("note1", "like", "%" . request("note") . "%");
         } */

        // $accountings = $query->orderBy($sortField, $sortDirection)->paginate(10);
        //$accountings = $query::with('detailAccounting')->paginate(10);
        $accountings = $query->paginate(10);



        //$details = Accounting::find($accountings->id);
        //dd( $accountings);

        return inertia('Accounting/Index', [

            "accountings" => AccountingResource::collection($accountings),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),

        ]);


    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Accounting/Import");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountingRequest $request)
    {

        $requestData = $request;
        /** @var $files \Illuminate\Http\UploadedFile */
        $files = $requestData['xml_data'] ?? null;
        //dd($files);
        $xmlString = file_get_contents($files[0]);
        $xmlObject = simplexml_load_string($xmlString);



        $json = json_encode($xmlObject);

        $phpArray = json_decode($json, true);



        //dd($phpArray);


        /*  $Accounting_array = 
         array(
             //'TipoDocumento' =>  $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["TipoDocumento"],
             

             'ProgressivoInvio' => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["ProgressivoInvio"],
             "FormatoTrasmissione" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["FormatoTrasmissione"],
             "FornitoreIdPaese" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdPaese"],
             "FornitoreIdCodice" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdCodice"],
             "FornitoreCodiceFiscale" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["CodiceFiscale"],
             "FornitoreNome" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["Anagrafica"]["Denominazione"],
             "FornitoreRegimeFiscale" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["RegimeFiscale"],

             "FornitoreSedeIndirizzo" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Indirizzo"],
             "FornitoreSedeCAP" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["CAP"],
             "FornitoreSedeComune" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Comune"],
             "FornitoreSedeProvincia" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Provincia"],
             "FornitoreSedeNazione" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Nazione"],
             "FornitoreTelefono" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Contatti"]["Telefono"],
             "FornitoreEmail" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Contatti"]["Email"],

             "UfficioRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["Ufficio"],
             "NumeroRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["NumeroREA"],
             "CapitaleSocialeRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["CapitaleSociale"],
             "SocioUnicoRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["SocioUnico"],
             "StatoLiquidazioneRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["StatoLiquidazione"],

             "TipoDocumento" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["TipoDocumento"],
             "Divisa" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Divisa"],
             "Data" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Data"],
             "Numero" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Numero"],
             "ImportoTotaleDocumento" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["ImportoTotaleDocumento"],
            
             "CodiceArticoloTipo1" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["CodiceArticolo"][0]["CodiceTipo"],
             "CodiceArticoloValore1" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["CodiceArticolo"][0]["CodiceValore"],
             "CodiceArticoloTipo2" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][1]["CodiceArticolo"][0]["CodiceTipo"],
             "CodiceArticoloValore2" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][1]["CodiceArticolo"][0]["CodiceValore"],
             "Descrizione" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["Descrizione"],
             "Quantita" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["Quantita"],
             "UnitaMisura" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["UnitaMisura"],
             "PrezzoUnitario" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["PrezzoUnitario"],
             "PrezzoTotale" =>  $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["PrezzoTotale"],
             "AliquotaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["AliquotaIVA"],

             "RiepilogoAliquotaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["AliquotaIVA"],
             "RiepilogoSpeseAccessorie" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["SpeseAccessorie"],
             "RiepilogoImponibileImporto" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["ImponibileImporto"],
             "RiepilogoImposta" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["Imposta"],
             "RiepilogoEsigibilitaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["EsigibilitaIVA"],
         
             "ModalitaPagamento1" =>  $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][0]["ModalitaPagamento"],
             "DataScadenzaPagamento1" =>  $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][0]["DataScadenzaPagamento"],
             "ImportoPagamento1" => $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][0]["ImportoPagamento"],
             "ModalitaPagamento2" =>  $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][1]["ModalitaPagamento"],
             "DataScadenzaPagamento2" =>  $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][1]["DataScadenzaPagamento"],
             "ImportoPagamento2" => $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"][1]["ImportoPagamento"],
            
             "Stato" => "Aperta",


         ); */

        //dd($Accounting_array);

        $Accounting_array = array(
            'ProgressivoInvio' => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["ProgressivoInvio"]  ?? null,
            "FormatoTrasmissione" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["FormatoTrasmissione"] ?? null,
            "FornitoreIdPaese" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdPaese"] ?? null,
            "FornitoreIdCodice" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdCodice"] ?? null,
            //"FornitoreCodiceFiscale" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["CodiceFiscale"],
            "FornitoreCodiceFiscale" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["CodiceFiscale"]
    ?? $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["IdFiscaleIVA"]["IdCodice"]
    ?? null,
            "FornitoreNome" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["Anagrafica"]["Denominazione"] ?? null,
            "FornitoreRegimeFiscale" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"]["RegimeFiscale"] ?? null,
            "FornitoreSedeIndirizzo" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Indirizzo"] ?? null,
            "FornitoreSedeCAP" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["CAP"] ?? null,
            "FornitoreSedeComune" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Comune"] ?? null,
            "FornitoreSedeProvincia" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Provincia"] ?? null,
            "FornitoreSedeNazione" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Sede"]["Nazione"] ?? null,
            "FornitoreTelefono" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Contatti"]["Telefono"] ?? null,
            "FornitoreEmail" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["Contatti"]["Email"] ?? null,
            "UfficioRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["Ufficio"] ?? null,
            "NumeroRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["NumeroREA"] ?? null,
            "CapitaleSocialeRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["CapitaleSociale"] ?? null,
            "SocioUnicoRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["SocioUnico"] ?? null,
            "StatoLiquidazioneRea" => $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["IscrizioneREA"]["StatoLiquidazione"] ?? null,
            "TipoDocumento" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["TipoDocumento"] ?? null,
            "Divisa" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Divisa"] ?? null,
            "Data" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Data"] ?? null,
            "Numero" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Numero"] ?? null,
            "ImportoTotaleDocumento" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["ImportoTotaleDocumento"]  ?? null,

            "CodiceArticoloTipo1" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["CodiceArticolo"][0]["CodiceTipo"]  ?? null,
            "CodiceArticoloValore1" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["CodiceArticolo"][0]["CodiceValore"] ?? null,
            "CodiceArticoloTipo2" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][1]["CodiceArticolo"][0]["CodiceTipo"] ?? null,
            "CodiceArticoloValore2" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][1]["CodiceArticolo"][0]["CodiceValore"] ?? null,
            "Descrizione" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["Descrizione"] ?? null,
            "Quantita" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["Quantita"] ?? null,
            "UnitaMisura" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["UnitaMisura"] ?? null,
            "PrezzoUnitario" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["PrezzoUnitario"] ?? null,
            "PrezzoTotale" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["PrezzoTotale"] ?? null,
            "AliquotaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["AliquotaIVA"] ?? null,

            "RiepilogoAliquotaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["AliquotaIVA"] ?? null,
            "RiepilogoSpeseAccessorie" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["SpeseAccessorie"] ?? null,
            "RiepilogoImponibileImporto" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["ImponibileImporto"] ?? null,
            "RiepilogoImposta" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["Imposta"] ?? null,
            "RiepilogoEsigibilitaIVA" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DatiRiepilogo"]["EsigibilitaIVA"] ?? null,


            "Stato" => "Aperta",
        );

        $savedAccounting = Accounting::create($Accounting_array);
        //dd( $savedAccounting);
        /* // Gestione dinamica dei DettaglioLinee
        if (!empty($phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"])) {
            foreach ($phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"] as $index => $dettaglio) {
                $Accounting_array["CodiceArticoloTipo" . ($index + 1)] = $dettaglio["CodiceArticolo"][0]["CodiceTipo"] ?? null;
                $Accounting_array["CodiceArticoloValore" . ($index + 1)] = $dettaglio["CodiceArticolo"][0]["CodiceValore"] ?? null;
                $Accounting_array["Descrizione" . ($index + 1)] = $dettaglio["Descrizione"] ?? null;
                $Accounting_array["Quantita" . ($index + 1)] = $dettaglio["Quantita"] ?? null;
                $Accounting_array["UnitaMisura" . ($index + 1)] = $dettaglio["UnitaMisura"] ?? null;
                $Accounting_array["PrezzoUnitario" . ($index + 1)] = $dettaglio["PrezzoUnitario"] ?? null;
                $Accounting_array["PrezzoTotale" . ($index + 1)] = $dettaglio["PrezzoTotale"] ?? null;
                $Accounting_array["AliquotaIVA" . ($index + 1)] = $dettaglio["AliquotaIVA"] ?? null;
            }
        } */

        // Gestione dinamica dei DettaglioPagamento
        if (!empty($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"])) {
            foreach ($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"] as $index => $pagamento) {

                $Accounting_array_detail["accountingId"] =  (string) $savedAccounting->id;
                $Accounting_array_detail["modalitaPagamento"] = $pagamento["ModalitaPagamento"] ?? null;
                $Accounting_array_detail["dataScadenzaPagamento"] = $pagamento["DataScadenzaPagamento"] ?? null;
                $Accounting_array_detail["importoPagamento"] = $pagamento["ImportoPagamento"] ?? null;
                $Accounting_array_detail["stato"] = "aperta";
                
                //dd( $Accounting_array_detail);
               // DetailAccounting::create($Accounting_array_detail);
               DB::table('detail_accountings')->insert($Accounting_array_detail);
            }
        }

        // Salva nel database

       



        return inertia("Accounting/Import")->with('success', 'Fattura importata');


    }

    /**
     * Display the specified resource.
     */
    public function show(Accounting $accounting)
    {
        return inertia("Accounting/Import");
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Accounting $accounting)
    {
        return inertia("Accounting/Edit", ['accounting' => new AccountingResource($accounting)]);
    }

    public function editprog(Accounting $accounting)
    {

        //dd($accounting);
        return inertia("Accounting/Editprog", ['accounting' => new AccountingResource($accounting)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountingRequest $request, Accounting $accounting)
    {

        //dd( $request);

        $validated = $request->validated();

        // Prepara la query SQL di aggiornamento
        $query = "
            UPDATE accountings
            SET
                Progressivo = ?
                
            WHERE id = ?
        ";

        // Esegui la query con i dati validati
        DB::statement($query, [
            $validated['Progressivo'],
            $request->id, // ID del record da aggiornare
        ]);

        // Successo
        return redirect()->route('accounting.index')->with('success', 'Progressivo modificato');
    


        //$accounting->update($request->validated());
        //return to_route('accounting.index')->with('success', 'Fattura modificata');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Accounting $accounting)
    {
        $accounting->delete();
        return to_route('accounting.index')
            ->with('success', "Fattura eliminata");
    }

    public function import()
    {
        return inertia("Accounting/Import");
    }

}
