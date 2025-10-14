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
    public function index()
    {
        $query = Accounting::query()
            ->with(['detailAccounting' => fn($q) => $q->orderBy('dataScadenzaPagamento')]);

        // Filtri
        if ($v = request('stato'))            $query->where('Stato', $v);
        if ($v = request('progressivo')) {
            request()->query->remove('page');
            $query->where('Progressivo', 'like', "%$v%");
        }
        if ($v = request('progressivoinvio')) {
            request()->query->remove('page');
            $query->where('ProgressivoInvio', 'like', "%$v%");
        }
        if ($v = request('name') ?? request('nome')) {
            request()->query->remove('page');
            $query->where('FornitoreNome', 'like', "%$v%");
        }
        if ($v = request('numero')) {
            request()->query->remove('page');
            $query->where('Numero', 'like', "%$v%");
        }
        if ($v = request('date_from'))        $query->whereDate('Data', '>=', $v);
        if ($v = request('date_to'))          $query->whereDate('Data', '<=', $v);

        // Ordinamento (come Clients)
        $sortField     = request('sort_field', 'Progressivo');
        $sortDirection = request('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $accountings = $query->paginate(10);

        return inertia('Accounting/Index', [
            'accountings' => AccountingResource::collection($accountings),
            'queryParams' => request()->query() ?: null,
            'success'     => session('success'),
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
                    'file' => $fileName,
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
            'Stato'                    => ['sometimes', 'required', 'in:aperta,pagata,parziale'],
        ]);

        $accounting->update($data);
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
            'statusOptions' => ['aperta','pagata','parziale'],
            'success' => session('success'),
        ]);
    }
}
