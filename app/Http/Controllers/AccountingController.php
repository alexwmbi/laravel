<?php

namespace App\Http\Controllers;

use App\Http\Resources\AccountingResource;
use App\Models\Accounting;
use App\Http\Requests\StoreAccountingRequest;
use App\Http\Requests\UpdateAccountingRequest;
use App\Models\DetailAccounting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountingController extends Controller
{
    /** Tipi SdI che rappresentano note di credito */
    private const CREDIT_NOTE_TYPES = ['TD04'];

    public function index(Request $request)
    {
        // ===== 1) Base query con filtri =====
        $base = Accounting::query();

        // Filtri
        if ($request->filled('stato')) {
            $base->whereRaw('LOWER(`Stato`) = ?', [strtolower($request->string('stato'))]);
        }

        if ($request->filled('progressivo')) {
            $base->where('Progressivo', 'like', '%' . $request->string('progressivo') . '%');
        }

        if ($request->filled('progressivoinvio')) {
            $base->where('ProgressivoInvio', 'like', '%' . $request->string('progressivoinvio') . '%');
        }

        $name = $request->input('name', $request->input('nome'));
        if (filled($name)) {
            $base->where('FornitoreNome', 'like', '%' . $name . '%');
        }

        if ($request->filled('numero')) {
            $base->where('Numero', 'like', '%' . $request->string('numero') . '%');
        }

        if ($request->filled('date_from')) {
            $base->whereDate('Data', '>=', $request->date('date_from')->format('Y-m-d'));
        }
        if ($request->filled('date_to')) {
            $base->whereDate('Data', '<=', $request->date('date_to')->format('Y-m-d'));
        }

        // Filtra per tipo documento (TD01 fattura, TD04 nota di credito)
        if ($request->filled('tipo_documento')) {
            $base->where('TipoDocumento', '=', $request->string('tipo_documento'));
        }

        // ===== 2) Totali con gli stessi filtri =====
        $count = (clone $base)->count();

        // Totale documenti con segno coerente al tipo (robusto anche se ci fossero dati pregressi non normalizzati)
        $sumDocs = (clone $base)->selectRaw("
            COALESCE(SUM(
                CASE
                  WHEN TipoDocumento IN ('TD04') THEN -ABS(ImportoTotaleDocumento)
                  ELSE ABS(ImportoTotaleDocumento)
                END
            ), 0) as s
        ")->value('s');

        // Pagato con segno coerente (le NC sottraggono)
        $filteredIdsSub = (clone $base)->select('id'); // subquery id filtrati
        $sumPaid = DB::table('detail_accountings as d')
            ->joinSub($filteredIdsSub, 'a', 'd.accountingId', '=', 'a.id')
            ->join('accountings as h', 'h.id', '=', 'd.accountingId')
            ->where('d.stato', '=', 'pagata')
            ->selectRaw("
                COALESCE(SUM(
                  CASE
                    WHEN h.TipoDocumento IN ('TD04') THEN -ABS(d.importoPagamento)
                    ELSE ABS(d.importoPagamento)
                  END
                ), 0) as s
            ")
            ->value('s');

        // Residuo = Totale documenti - Pagato (può essere negativo se prevalgono NC)
        $sumDue = (float)$sumDocs - (float)$sumPaid;

        $totals = [
            'count'    => (int) $count,
            'sum_docs' => (float) $sumDocs,
            'sum_paid' => (float) $sumPaid,
            'sum_due'  => (float) $sumDue,
        ];

        // ===== 3) Listing con ordinamento/paginazione =====
        $tableQuery = (clone $base)
            ->with(['detailAccounting' => fn($q) => $q->orderBy('dataScadenzaPagamento')]);

        // Allowlist campi ordinamento
        $allowedSort = [
            'Progressivo',
            'ProgressivoInvio',
            'FornitoreNome',
            'Numero',
            'Data',
            'ImportoTotaleDocumento',
            'Stato',
        ];
        $sortField = $request->input('sort_field', 'Progressivo');
        if (!in_array($sortField, $allowedSort, true)) {
            $sortField = 'Progressivo';
        }

        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        // Ordinamento numerico per Progressivo/Numero se necessario
        if ($sortField === 'Progressivo') {
            $tableQuery
                ->orderByRaw('CAST(`Progressivo` AS UNSIGNED) ' . $sortDirection)
                ->orderBy('Progressivo', $sortDirection);
        } elseif ($sortField === 'Numero') {
            $tableQuery
                ->orderByRaw('CAST(`Numero` AS UNSIGNED) ' . $sortDirection)
                ->orderBy('Numero', $sortDirection);
        } else {
            $tableQuery->orderBy($sortField, $sortDirection);
        }

        $accountings = $tableQuery->paginate(10)->appends($request->query());

        // ===== 4) Response =====
        return inertia('Accounting/Index', [
            'accountings' => AccountingResource::collection($accountings),
            'queryParams' => $request->query() ?: null,
            'success'     => session('success'),
            'totals'      => $totals,
        ]);
    }

    public function create()
    {
        return inertia("Accounting/Import");
    }

    public function store(StoreAccountingRequest $request)
    {
        Log::info('🚨 Entra nel metodo store');

        $files = $request->file('xml_data') ?? [];
        Log::info("🧪 File ricevuti: " . count($files));
        $importSuccess = 0;
        $importErrors = [];

        foreach ($files as $file) {
            $fileName = $file->getClientOriginalName();
            Log::info("🔁 Inizio elaborazione file: $fileName");

            try {
                $xmlString = file_get_contents($file);
                $xmlObject = simplexml_load_string($xmlString);

                if ($xmlObject === false) {
                    throw new \Exception("XML non valido");
                }

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

                $anagrafica = $phpArray["FatturaElettronicaHeader"]["CedentePrestatore"]["DatiAnagrafici"] ?? [];

                $Accounting_array = [
                    'ProgressivoInvio'         => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["ProgressivoInvio"] ?? null,
                    'FormatoTrasmissione'      => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["FormatoTrasmissione"] ?? null,
                    'FornitoreIdPaese'         => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdPaese"] ?? null,
                    'FornitoreIdCodice'        => $phpArray["FatturaElettronicaHeader"]["DatiTrasmissione"]["IdTrasmittente"]["IdCodice"] ?? null,
                    'FornitoreCodiceFiscale'   => $anagrafica["CodiceFiscale"] ?? $anagrafica["IdFiscaleIVA"]["IdCodice"] ?? null,
                    'FornitoreNome'            => $anagrafica["Anagrafica"]["Denominazione"] ?? null,
                    'TipoDocumento'            => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["TipoDocumento"] ?? null,
                    'Numero'                   => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Numero"] ?? null,
                    'Data'                     => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["Data"] ?? null,
                    'ImportoTotaleDocumento'   => $phpArray["FatturaElettronicaBody"]["DatiGenerali"]["DatiGeneraliDocumento"]["ImportoTotaleDocumento"] ?? null,
                    'Stato'                    => 'aperta',
                ];

                // ===== segno coerente con TipoDocumento =====
                $rawTotal = (float)($Accounting_array['ImportoTotaleDocumento'] ?? 0);
                $isCredit = in_array($Accounting_array['TipoDocumento'], self::CREDIT_NOTE_TYPES, true);
                $Accounting_array['ImportoTotaleDocumento'] = $isCredit ? -abs($rawTotal) : abs($rawTotal);

                // logging campi vuoti (facoltativo)
                $campiVuoti = [];
                foreach ($Accounting_array as $k => $v) {
                    if (is_null($v) || (is_string($v) && trim($v) === '')) {
                        $campiVuoti[] = $k;
                    }
                }
                if (!empty($campiVuoti)) {
                    Log::warning("⚠️ [$fileName] Campi mancanti/empty: " . implode(', ', $campiVuoti));
                }

                if (empty($Accounting_array['ProgressivoInvio'])) {
                    throw new \Exception("Campo obbligatorio mancante: ProgressivoInvio");
                }

                $savedAccounting = Accounting::create($Accounting_array);

                foreach ($phpArray["FatturaElettronicaBody"]["DatiPagamento"]["DettaglioPagamento"] ?? [] as $pagamento) {
                    DB::table('detail_accountings')->insert([
                        'accountingId'          => $savedAccounting->id,
                        'modalitaPagamento'     => $pagamento["ModalitaPagamento"] ?? null,
                        'dataScadenzaPagamento' => $pagamento["DataScadenzaPagamento"] ?? null,
                        'importoPagamento'      => $pagamento["ImportoPagamento"] ?? null,
                        'stato'                 => 'aperta',
                        'tipoPagamento'         => null,
                        'note'                  => null,
                    ]);
                }

                Log::info("✅ [$fileName] Importazione riuscita.");
                $importSuccess++;
            } catch (\Throwable $e) {
                Log::error("❌ [$fileName] Errore: " . $e->getMessage());
                $importErrors[] = [
                    'file'  => $fileName,
                    'error' => $e->getMessage()
                ];
            }
        }

        return redirect()
            ->route('accounting.index')
            ->with('success', "$importSuccess fatture importate.")
            ->with('import_errors', $importErrors);
    }

    public function show(Accounting $accounting)
    {
        return inertia("Accounting/Import");
    }

    public function edit(Accounting $accounting)
    {
        // carica le righe pagamento ordinate
        $accounting->load(['detailAccounting' => fn($q) => $q->orderBy('dataScadenzaPagamento')]);

        return inertia('Accounting/Edit', [
            'accounting' => new AccountingResource($accounting),
            // passo le righe come array piatto per semplicità lato JSX
            'detailAccountings' => $accounting->detailAccounting->map(function ($d) {
                return [
                    'id' => $d->id,
                    'accountingId' => $d->accountingId,
                    'stato' => $d->stato,
                    'modalitaPagamento' => $d->modalitaPagamento,
                    'tipoPagamento' => $d->tipoPagamento,
                    'dataScadenzaPagamento' => $d->dataScadenzaPagamento,
                    'importoPagamento' => $d->importoPagamento,
                    'note' => $d->note,
                ];
            }),
            'backQuery' => request()->query() ?: null,
        ]);
    }

    public function editprog(Accounting $accounting)
    {
        return inertia("Accounting/Editprog", ['accounting' => new AccountingResource($accounting)]);
    }

    public function update(UpdateAccountingRequest $request, Accounting $accounting)
    {
        $validated = $request->validated();
        $accounting->update($validated);

        return redirect()->route('accounting.index')->with('success', 'Progressivo modificato');
    }

    public function destroy(Accounting $accounting)
    {
        $accounting->delete();
        return to_route('accounting.index')->with('success', "Fattura eliminata");
    }

    public function import()
    {
        return inertia("Accounting/Import");
    }

    // === 3.2 – Update “generico” della fattura (inline/field-level)
    public function patchField(Request $request, Accounting $accounting)
    {
        $data = $request->validate([
            'Progressivo'              => ['sometimes', 'nullable', 'string'],
            'ProgressivoInvio'         => ['sometimes', 'nullable', 'string'],
            'FornitoreNome'            => ['sometimes', 'nullable', 'string'],
            'Numero'                   => ['sometimes', 'nullable', 'string'],
            'Data'                     => ['sometimes', 'nullable', 'date'],
            'ImportoTotaleDocumento'   => ['sometimes', 'nullable', 'numeric'],
            'TipoDocumento'            => ['sometimes', 'required', 'in:TD01,TD04'],
            'Stato'                    => ['sometimes', 'required', 'in:aperta,pagata,parziale'],
        ]);

        // Tipo effettivo (nuovo o esistente) per capire il segno
        $tipo = $data['TipoDocumento'] ?? $accounting->TipoDocumento;
        $isCredit = in_array($tipo, self::CREDIT_NOTE_TYPES, true);

        // Se l'importo arriva nel payload, normalizza il segno subito
        if (array_key_exists('ImportoTotaleDocumento', $data) && $data['ImportoTotaleDocumento'] !== null) {
            $amount = abs((float)$data['ImportoTotaleDocumento']);
            $data['ImportoTotaleDocumento'] = $isCredit ? -$amount : $amount;
        }

        // Aggiorna i campi passati
        $accounting->update($data);

        // Se è cambiato solo il tipo, riallinea il segno dell'importo già in DB
        if (!array_key_exists('ImportoTotaleDocumento', $data) && array_key_exists('TipoDocumento', $data)) {
            $amount = abs((float)$accounting->ImportoTotaleDocumento);
            $accounting->update([
                'ImportoTotaleDocumento' => $isCredit ? -$amount : $amount,
            ]);
        }

        return back()->with('success', 'Fattura aggiornata');
    }

    // === 3.3 – CRUD delle righe pagamento
    public function storeDetail(Request $request, Accounting $accounting)
    {
        $data = $request->validate([
            'stato'                 => ['required', 'in:aperta,pagata,parziale'],
            'modalitaPagamento'     => ['nullable', 'string', 'max:100'],
            'tipoPagamento'         => ['nullable', 'in:bonifico,riba,contanti,assegno'],
            'dataScadenzaPagamento' => ['nullable', 'date'],
            'importoPagamento'      => ['nullable', 'numeric'],
            'note'                  => ['nullable', 'string', 'max:500'],
        ]);
        $data['accountingId'] = $accounting->id;

        DetailAccounting::create($data);
        return back()->with('success', 'Riga pagamento aggiunta');
    }

    public function updateDetail(Request $request, DetailAccounting $detail)
    {
        $data = $request->validate([
            'stato'                 => ['sometimes', 'required', 'in:aperta,pagata,parziale'],
            'modalitaPagamento'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'tipoPagamento'         => ['sometimes', 'nullable', 'in:bonifico,riba,contanti,assegno'],
            'dataScadenzaPagamento' => ['sometimes', 'nullable', 'date'],
            'importoPagamento'      => ['sometimes', 'nullable', 'numeric'],
            'note'                  => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $detail->update($data);
        return back()->with('success', 'Riga pagamento aggiornata');
    }

    public function destroyDetail(DetailAccounting $detail)
    {
        $detail->delete();
        return back()->with('success', 'Riga pagamento eliminata');
    }

    // === Nuovo: pagina di edit della singola riga pagamento
    public function editDetail(DetailAccounting $detail)
    {
        // opzionale: se esiste la relazione "accounting", la carico per eventuali usi
        $detail->loadMissing('accounting');

        return inertia('DetailAccounting/Edit', [
            'detailAccounting' => [
                'id' => $detail->id,
                'accountingId' => $detail->accountingId,
                'stato' => $detail->stato,
                'modalitaPagamento' => $detail->modalitaPagamento,
                'tipoPagamento' => $detail->tipoPagamento,
                'dataScadenzaPagamento' => $detail->dataScadenzaPagamento,
                'importoPagamento' => $detail->importoPagamento,
                'note' => $detail->note,
            ],
            'statusOptions' => ['aperta', 'pagata', 'parziale'],
            'backQuery'     => request()->query() ?: null,
            'success'       => session('success'),
        ]);
    }
}
