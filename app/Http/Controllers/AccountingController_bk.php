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
    public function index()
    {
        $query = Accounting::query()->with('detailAccounting');
        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');

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

        $accountings = $query->paginate(10);

        return inertia('Accounting/Index', [
            "accountings" => AccountingResource::collection($accountings),
            "queryParams" => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return inertia("Accounting/Import");
    }

    public function store(StoreAccountingRequest $request)
    {
        $requestData = $request;
        $files = $requestData['xml_data'] ?? null;
        $xmlString = file_get_contents($files[0]);
        $xmlObject = simplexml_load_string($xmlString);
        $json = json_encode($xmlObject);
        $phpArray = json_decode($json, true);

        // Forza DettaglioPagamento in array se singolo
        if (
            isset($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"]) &&
            isset($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"]["ModalitaPagamento"])
        ) {
            $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"] = [
                $phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"]
            ];
        }

        $anagrafica = $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"];

        $Accounting_array = array(
            'ProgressivoInvio' => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["ProgressivoInvio"],
            "FormatoTrasmissione" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["FormatoTrasmissione"],
            "FornitoreIdPaese" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdPaese"],
            "FornitoreIdCodice" => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdCodice"],
            "FornitoreCodiceFiscale" => $anagrafica["CodiceFiscale"]
                ?? $anagrafica["IdFiscaleIVA"]["IdCodice"]
                ?? null,
            "FornitoreNome" => $anagrafica["Anagrafica"]["Denominazione"] ?? null,
            "FornitoreRegimeFiscale" => $anagrafica["RegimeFiscale"] ?? null,
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
            "ImportoTotaleDocumento" => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["ImportoTotaleDocumento"] ?? null,
            "CodiceArticoloTipo1" => $phpArray["FatturaElettronicaBody"]["DatiBeniServizi"]["DettaglioLinee"][0]["CodiceArticolo"][0]["CodiceTipo"] ?? null,
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

        if (!empty($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"])) {
            foreach ($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"] as $index => $pagamento) {
                $Accounting_array_detail["accountingId"] =  (string) $savedAccounting->id;
                $Accounting_array_detail["modalitaPagamento"] = $pagamento["ModalitaPagamento"] ?? null;
                $Accounting_array_detail["dataScadenzaPagamento"] = $pagamento["DataScadenzaPagamento"] ?? null;
                $Accounting_array_detail["importoPagamento"] = $pagamento["ImportoPagamento"] ?? null;
                $Accounting_array_detail["stato"] = "aperta";

                DB::table('detail_accountings')->insert($Accounting_array_detail);
            }
        }

        return inertia("Accounting/Import")->with('success', 'Fattura importata');
    }

    public function show(Accounting $accounting)
    {
        return inertia("Accounting/Import");
    }

    public function edit(Accounting $accounting)
    {
        return inertia("Accounting/Edit", ['accounting' => new AccountingResource($accounting)]);
    }

    public function editprog(Accounting $accounting)
    {
        return inertia("Accounting/Editprog", ['accounting' => new AccountingResource($accounting)]);
    }

    public function update(UpdateAccountingRequest $request, Accounting $accounting)
    {
        $validated = $request->validated();

        $query = "
            UPDATE accountings
            SET
                Progressivo = ?
            WHERE id = ?
        ";

        DB::statement($query, [
            $validated['Progressivo'],
            $request->id,
        ]);

        return redirect()->route('accounting.index')->with('success', 'Progressivo modificato');
    }

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