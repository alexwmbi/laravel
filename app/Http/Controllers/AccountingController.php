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
        // if ($sortField === 'Progressivo') {
        //     $tableQuery
        //         ->orderByRaw('CAST(`Progressivo` AS UNSIGNED) ' . $sortDirection)
        //         ->orderBy('Progressivo', $sortDirection);
        // } elseif ($sortField === 'Numero') {
        //     $tableQuery
        //         ->orderByRaw('CAST(`Numero` AS UNSIGNED) ' . $sortDirection)
        //         ->orderBy('Numero', $sortDirection);
        // } else {
        //     $tableQuery->orderBy($sortField, $sortDirection);
        // }

        if ($sortField === 'Progressivo') {
            $dir = $sortDirection;
            $tableQuery->orderByRaw("
        CASE
          WHEN `Progressivo` REGEXP '^[0-9]+_[0-9]{2}$' THEN CAST(RIGHT(`Progressivo`, 2) AS UNSIGNED)
          ELSE -1
        END {$dir}
    ")->orderByRaw("
        CASE
          WHEN `Progressivo` REGEXP '^[0-9]+_[0-9]{2}$' THEN CAST(SUBSTRING_INDEX(`Progressivo`, '_', 1) AS UNSIGNED)
          ELSE CAST(`Progressivo` AS UNSIGNED)
        END {$dir}
    ");
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
        $importErrors  = [];

        foreach ($files as $file) {
            $fileName = $file->getClientOriginalName();
            Log::info("🔁 Inizio elaborazione file: $fileName");

            try {
                $xmlString = file_get_contents($file);
                $xmlObject = simplexml_load_string($xmlString);
                if ($xmlObject === false) {
                    throw new \Exception("XML non valido");
                }

                // Array PHP dal SimpleXML
                $arr = json_decode(json_encode($xmlObject), true);

                // ==== Helpers "elastici" ====
                $first = function ($val) {
                    return (is_array($val) && array_key_exists(0, $val)) ? $val[0] : $val;
                };
                $asArray = function ($val) {
                    if ($val === null) return [];
                    if (is_array($val) && array_key_exists(0, $val)) return $val;
                    return [$val];
                };
                // Parsing numeri: supporta "1.234,56" e "1234.56" senza rompere i decimali
                $toFloat = function ($v) {
                    if ($v === null || $v === '') return null;
                    $s = trim((string)$v);
                    if (str_contains($s, '.') && str_contains($s, ',')) {
                        // Es: 1.234,56 (it) -> 1234.56
                        $s = str_replace('.', '', $s);
                        $s = str_replace(',', '.', $s);
                    } elseif (str_contains($s, ',') && !str_contains($s, '.')) {
                        // Es: 1234,56 -> 1234.56
                        $s = str_replace(',', '.', $s);
                    }
                    // Se ha solo '.', è già formato XML standard
                    return is_numeric($s) ? (float)$s : null;
                };

                // ==== Header/Body con fallback sicuri ====
                $header = $arr['FatturaElettronicaHeader'] ?? [];
                $bodies = $asArray($arr['FatturaElettronicaBody'] ?? []);
                $body   = $first($bodies);
                $body   = is_array($body) ? $body : [];

                // ---- Pagamenti (sempre array) ----
                $dpAll  = $asArray($body['DatiPagamento'] ?? []);
                $dp     = $first($dpAll);
                $detPag = $asArray($dp['DettaglioPagamento'] ?? []);

                // ---- Cedente/Prestatore + fallback ----
                $ced  = $header['CedentePrestatore'] ?? [];
                $da   = $ced['DatiAnagrafici'] ?? [];
                $ana  = $da['Anagrafica'] ?? [];
                $sede = $ced['Sede'] ?? ($ced['StabileOrganizzazione'] ?? []);
                $cont = $ced['Contatti'] ?? [];
                $rea  = $ced['IscrizioneREA'] ?? [];

                $den  = isset($ana['Denominazione']) ? trim((string)$ana['Denominazione']) : '';
                $nome = isset($ana['Nome']) ? trim((string)$ana['Nome']) : '';
                $cogn = isset($ana['Cognome']) ? trim((string)$ana['Cognome']) : '';
                $fornitoreDisplay = $den !== '' ? $den : (trim($nome . ' ' . $cogn) ?: null);

                // Se IdTrasmittente mancano, prendo IdFiscale del cedente
                $idPaese  = $header['DatiTrasmissione']['IdTrasmittente']['IdPaese']  ?? ($da['IdFiscaleIVA']['IdPaese']  ?? null);
                $idCodice = $header['DatiTrasmissione']['IdTrasmittente']['IdCodice'] ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null);

                // ---- Documento ----
                $dgd = $body['DatiGenerali']['DatiGeneraliDocumento'] ?? [];

                // ---- Dati Beni/Servizi (prima riga + riepilogo) ----
                $dbs   = $body['DatiBeniServizi'] ?? [];
                $linee = $asArray($dbs['DettaglioLinee'] ?? []);
                $firstLine = $first($linee) ?? null;

                $riep = $asArray($dbs['DatiRiepilogo'] ?? []);
                $sumImponibile = 0.0;
                $sumImposta    = 0.0;
                $sumSpeseAcc   = 0.0;
                $aliquote      = [];
                $riepEsig      = null;
                foreach ($riep as $r) {
                    $sumImponibile += (float)($r['ImponibileImporto'] ?? 0);
                    $sumImposta    += (float)($r['Imposta'] ?? 0);
                    $sumSpeseAcc   += (float)($r['SpeseAccessorie'] ?? 0);
                    if (isset($r['AliquotaIVA'])) $aliquote[] = (string)$r['AliquotaIVA'];
                    if (!$riepEsig && !empty($r['EsigibilitaIVA'])) $riepEsig = $r['EsigibilitaIVA'];
                }
                $aliquotaUniforme = (count(array_unique($aliquote)) === 1) ? ($aliquote[0] ?? null) : null;

                // ---- Cerca riga "bollo" (descrizione) ----
                $bollo = null;
                foreach ($linee as $ln) {
                    $descr = isset($ln['Descrizione']) ? mb_strtolower(trim((string)$ln['Descrizione'])) : '';
                    if ($descr !== '' && preg_match('/\bbollo\b|marca\s+da\s+bollo|imposta\s+di\s+bollo|rimborso\s+spese\s+di\s+bollo/u', $descr)) {
                        $bollo = $ln;
                        break;
                    }
                }

                // ---- Codici articolo (se esistono) ----
                $codArtTipo1 = $codArtVal1 = $codArtTipo2 = $codArtVal2 = null;
                if (is_array($firstLine) && !empty($firstLine['CodiceArticolo'])) {
                    $codes = $firstLine['CodiceArticolo'];
                    if (isset($codes['CodiceTipo']) || isset($codes['CodiceValore'])) {
                        $codes = [$codes]; // wrap singolo
                    }
                    $codes = array_values($codes);
                    if (isset($codes[0]) && is_array($codes[0])) {
                        $codArtTipo1 = $codes[0]['CodiceTipo']   ?? null;
                        $codArtVal1  = $codes[0]['CodiceValore'] ?? null;
                    }
                    if (isset($codes[1]) && is_array($codes[1])) {
                        $codArtTipo2 = $codes[1]['CodiceTipo']   ?? null;
                        $codArtVal2  = $codes[1]['CodiceValore'] ?? null;
                    }
                }

                // ==== Build array insert (retro-compat + extra sicuri) ====
                $Accounting_array = [
                    // Trasmissione (vecchio import li popolava)
                    'ProgressivoInvio'    => $header['DatiTrasmissione']['ProgressivoInvio'] ?? null,
                    'FormatoTrasmissione' => $header['DatiTrasmissione']['FormatoTrasmissione'] ?? null,
                    'FornitoreIdPaese'    => $idPaese,
                    'FornitoreIdCodice'   => $idCodice,

                    // Cedente/Prestatore (vecchio import: CF, Denominazione)
                    'FornitoreCodiceFiscale' => $da['CodiceFiscale'] ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null),
                    'FornitoreNome'          => $fornitoreDisplay,

                    // Extra “storici” (se presenti nell’XML: restano opzionali)
                    'FornitoreRegimeFiscale' => $da['RegimeFiscale'] ?? null,
                    'FornitoreSedeIndirizzo' => $sede['Indirizzo'] ?? null,
                    'FornitoreSedeCAP'       => $sede['CAP'] ?? null,
                    'FornitoreSedeComune'    => $sede['Comune'] ?? null,
                    'FornitoreSedeProvincia' => $sede['Provincia'] ?? null,
                    'FornitoreSedeNazione'   => $sede['Nazione'] ?? null,
                    'FornitoreTelefono'      => $cont['Telefono'] ?? null,
                    'FornitoreEmail'         => $cont['Email'] ?? null,
                    'UfficioRea'             => $rea['Ufficio'] ?? null,
                    'NumeroRea'              => $rea['NumeroREA'] ?? null,
                    'CapitaleSocialeRea'     => $rea['CapitaleSociale'] ?? null,
                    'SocioUnicoRea'          => $rea['SocioUnico'] ?? null,
                    'StatoLiquidazioneRea'   => $rea['StatoLiquidazione'] ?? null,

                    // Documento (vecchio import li popolava)
                    'TipoDocumento'            => $dgd['TipoDocumento'] ?? null,
                    'Divisa'                   => $dgd['Divisa'] ?? null,
                    'Data'                     => $dgd['Data'] ?? null,
                    'Numero'                   => $dgd['Numero'] ?? null,
                    'ImportoTotaleDocumento'   => $dgd['ImportoTotaleDocumento'] ?? null,

                    // Prima riga bene/servizio (storico, opzionale)
                    'CodiceArticoloTipo1'   => $codArtTipo1,
                    'CodiceArticoloValore1' => $codArtVal1,
                    'CodiceArticoloTipo2'   => $codArtTipo2,
                    'CodiceArticoloValore2' => $codArtVal2,
                    'Descrizione'           => $firstLine['Descrizione']    ?? null,
                    'Quantita'              => $firstLine['Quantita']       ?? null,
                    'UnitaMisura'           => $firstLine['UnitaMisura']    ?? null,
                    'PrezzoUnitario'        => $firstLine['PrezzoUnitario'] ?? null,
                    'PrezzoTotale'          => $firstLine['PrezzoTotale']   ?? null,
                    'AliquotaIVA'           => $firstLine['AliquotaIVA']    ?? null,

                    // Riepilogo (storico, opzionale)
                    'RiepilogoAliquotaIVA'       => $aliquotaUniforme,
                    'RiepilogoSpeseAccessorie'   => (string)$sumSpeseAcc,
                    'RiepilogoImponibileImporto' => (string)$sumImponibile,
                    'RiepilogoImposta'           => (string)$sumImposta,
                    'RiepilogoEsigibilitaIVA'    => $riepEsig,

                    // Pagamenti header (storico, opzionale)
                    'CondizioniPagamento'      => $dp['CondizioniPagamento'] ?? null,
                    'ModalitaPagamento1'       => $detPag[0]['ModalitaPagamento']     ?? null,
                    'DataScadenzaPagamento1'   => $detPag[0]['DataScadenzaPagamento'] ?? null,
                    'ImportoPagamento1'        => $detPag[0]['ImportoPagamento']      ?? null,
                    'ModalitaPagamento2'       => $detPag[1]['ModalitaPagamento']     ?? null,
                    'DataScadenzaPagamento2'   => $detPag[1]['DataScadenzaPagamento'] ?? null,
                    'ImportoPagamento2'        => $detPag[1]['ImportoPagamento']      ?? null,

                    // Tracking
                    'Stato'         => 'aperta',   // (vecchio era 'Aperta', il tuo cast gestisce la normalizzazione)
                    'xml_originale' => $xmlString,
                    'imported_at'   => now(),
                ];

                // --- Riga bollo (se presente) -> campi migration ---
                if ($bollo) {
                    $Accounting_array['BolloLineaNumero']      = isset($bollo['NumeroLinea']) ? (int)$bollo['NumeroLinea'] : null;
                    $Accounting_array['BolloLineaDescrizione'] = $bollo['Descrizione'] ?? null;
                    $Accounting_array['BolloPrezzoUnitario']   = $toFloat($bollo['PrezzoUnitario'] ?? null);
                    $Accounting_array['BolloPrezzoTotale']     = $toFloat($bollo['PrezzoTotale'] ?? null);
                    $Accounting_array['BolloAliquotaIVA']      = $toFloat($bollo['AliquotaIVA'] ?? null);
                    $Accounting_array['BolloNatura']           = $bollo['Natura'] ?? null;

                    Log::info("🧾 [$fileName] Riga bollo rilevata", [
                        'Numero'      => $Accounting_array['BolloLineaNumero'],
                        'Descrizione' => $Accounting_array['BolloLineaDescrizione'],
                        'PrezzoTotale' => $Accounting_array['BolloPrezzoTotale'],
                        'AliquotaIVA' => $Accounting_array['BolloAliquotaIVA'],
                        'Natura'      => $Accounting_array['BolloNatura'],
                    ]);
                }

                // --- Segno coerente su TD04 (note di credito) ---
                $rawTotal = (float)($Accounting_array['ImportoTotaleDocumento'] ?? 0);
                $isCredit = in_array($Accounting_array['TipoDocumento'], self::CREDIT_NOTE_TYPES, true);
                $Accounting_array['ImportoTotaleDocumento'] = $isCredit ? -abs($rawTotal) : abs($rawTotal);

                // --- Obbligatorio minimo: ProgressivoInvio ---
                if (empty($Accounting_array['ProgressivoInvio'])) {
                    throw new \Exception("Campo obbligatorio mancante: ProgressivoInvio");
                }

                // --- Progressivo auto (MAX + 1 per anno YY) ---
                if (empty($Accounting_array['Progressivo'])) {
                    $yy = now('Europe/Rome')->format('y'); // es. "25"

                    // Prende il massimo N SOLO dei progressivi del tipo "N_YY" (quell'anno)
                    $max = Accounting::whereRaw("`Progressivo` REGEXP ?", ["^[0-9]+_{$yy}$"])
                        ->selectRaw("MAX(CAST(SUBSTRING_INDEX(`Progressivo`, '_', 1) AS UNSIGNED)) as m")
                        ->value('m');

                    $next = ((int)($max ?? 0)) + 1;
                    $Accounting_array['Progressivo'] = $next . '_' . $yy; // es. "1_25"
                }


                // --- Warning campi vuoti ---
                $campiVuoti = [];
                foreach ($Accounting_array as $k => $v) {
                    if ($v === null || (is_string($v) && trim($v) === '')) {
                        $campiVuoti[] = $k;
                    }
                }
                if (!empty($campiVuoti)) {
                    Log::warning("⚠️ [$fileName] Campi mancanti/empty: " . implode(', ', $campiVuoti));
                }

                // --- Salva testata ---
                $savedAccounting = Accounting::create($Accounting_array);

                // --- Salva righe pagamento (retro-compat: stessi 3 campi + stato) ---
                foreach ($detPag as $pagamento) {
                    $mp = $pagamento['ModalitaPagamento'] ?? null;

                    // mapping MP -> dominio interno (opzionale, non rompe retro-compat)
                    $tipo = match ($mp) {
                        'MP05' => 'bonifico',
                        'MP12', 'MP13' => 'riba',
                        'MP01' => 'contanti',
                        'MP02', 'MP03' => 'assegno',
                        default => null,
                    };

                    DB::table('detail_accountings')->insert([
                        'accountingId'          => $savedAccounting->id,
                        'modalitaPagamento'     => $mp,
                        'dataScadenzaPagamento' => $pagamento['DataScadenzaPagamento'] ?? null,
                        'importoPagamento'      => isset($pagamento['ImportoPagamento']) ? (float)$pagamento['ImportoPagamento'] : null,
                        'stato'                 => 'aperta',
                        'tipoPagamento'         => $tipo,
                        'note'                  => null,
                    ]);
                }

                Log::info("✅ [$fileName] Importazione riuscita.");
                $importSuccess++;
            } catch (\Throwable $e) {
                Log::error("❌ [$fileName] Errore: " . $e->getMessage());
                $importErrors[] = ['file' => $fileName, 'error' => $e->getMessage()];
            }
        }

        return redirect()
            ->route('accounting.index')
            ->with('success', "$importSuccess fatture importate.")
            ->with('import_errors', $importErrors);
    }


    //    public function store(StoreAccountingRequest $request)
    // {
    //     Log::info('🚨 Entra nel metodo store');

    //     $files = $request->file('xml_data') ?? [];
    //     Log::info("🧪 File ricevuti: " . count($files));
    //     $importSuccess = 0;
    //     $importErrors  = [];

    //     foreach ($files as $file) {
    //         $fileName = $file->getClientOriginalName();
    //         Log::info("🔁 Inizio elaborazione file: $fileName");

    //         try {
    //             $xmlString = file_get_contents($file);
    //             $xmlObject = simplexml_load_string($xmlString);
    //             if ($xmlObject === false) {
    //                 throw new \Exception("XML non valido");
    //             }

    //             // Array PHP dal SimpleXML
    //             $arr = json_decode(json_encode($xmlObject), true);

    //             // ==== Helpers "elastici" ====
    //             $first = function ($val) {
    //                 return (is_array($val) && array_key_exists(0, $val)) ? $val[0] : $val;
    //             };
    //             $asArray = function ($val) {
    //                 if ($val === null) return [];
    //                 if (is_array($val) && array_key_exists(0, $val)) return $val;
    //                 return [$val];
    //             };
    //             // ⚠️ Fix: non rimuovere il '.' se è il separatore decimale dell'XML
    //             $toFloat = function ($v) {
    //                 if ($v === null || $v === '') return null;
    //                 $s = trim((string)$v);
    //                 // se contiene sia '.' che ',', assumo formattazione italiana "1.234,56"
    //                 if (str_contains($s, '.') && str_contains($s, ',')) {
    //                     $s = str_replace('.', '', $s);   // rimuovi separatore migliaia
    //                     $s = str_replace(',', '.', $s);  // virgola -> punto
    //                 } elseif (str_contains($s, ',') && !str_contains($s, '.')) {
    //                     // "1234,56" -> "1234.56"
    //                     $s = str_replace(',', '.', $s);
    //                 }
    //                 // se ha solo '.', è già OK (XML tipicamente usa '.')
    //                 return is_numeric($s) ? (float)$s : null;
    //             };

    //             // ==== Header / Body ====
    //             $header = $arr['FatturaElettronicaHeader'] ?? [];
    //             $bodies = $asArray($arr['FatturaElettronicaBody'] ?? []);
    //             $body   = $first($bodies);

    //             // ---- Dati pagamento (array sempre) ----
    //             $dpAll  = $asArray($body['DatiPagamento'] ?? []);
    //             $dp     = $first($dpAll);
    //             $detPag = $asArray($dp['DettaglioPagamento'] ?? []);

    //             // ---- Cedente/Prestatore (con fallback) ----
    //             $ced  = $header['CedentePrestatore'] ?? [];
    //             $da   = $ced['DatiAnagrafici'] ?? [];
    //             $ana  = $da['Anagrafica'] ?? [];
    //             $sede = $ced['Sede'] ?? ($ced['StabileOrganizzazione'] ?? []);
    //             $cont = $ced['Contatti'] ?? [];
    //             $rea  = $ced['IscrizioneREA'] ?? [];

    //             $den  = isset($ana['Denominazione']) ? trim((string)$ana['Denominazione']) : '';
    //             $nome = isset($ana['Nome']) ? trim((string)$ana['Nome']) : '';
    //             $cogn = isset($ana['Cognome']) ? trim((string)$ana['Cognome']) : '';
    //             $fornitoreDisplay = $den !== '' ? $den : (trim($nome.' '.$cogn) ?: null);

    //             // Se IdTrasmittente assenti, prendo dall'IdFiscale del cedente
    //             $idPaese  = $header['DatiTrasmissione']['IdTrasmittente']['IdPaese']  ?? ($da['IdFiscaleIVA']['IdPaese']  ?? null);
    //             $idCodice = $header['DatiTrasmissione']['IdTrasmittente']['IdCodice'] ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null);

    //             // ---- Documento ----
    //             $dgd = $body['DatiGenerali']['DatiGeneraliDocumento'] ?? [];

    //             // ---- Dati Beni/Servizi (prima riga + riepilogo) ----
    //             $dbs   = $body['DatiBeniServizi'] ?? [];
    //             $linee = $asArray($dbs['DettaglioLinee'] ?? []);
    //             $firstLine = $first($linee) ?? null;

    //             $riep = $asArray($dbs['DatiRiepilogo'] ?? []);
    //             $sumImponibile = 0.0;
    //             $sumImposta    = 0.0;
    //             $sumSpeseAcc   = 0.0;
    //             $aliquote      = [];
    //             $riepEsig      = null;
    //             foreach ($riep as $r) {
    //                 $sumImponibile += (float)($r['ImponibileImporto'] ?? 0);
    //                 $sumImposta    += (float)($r['Imposta'] ?? 0);
    //                 $sumSpeseAcc   += (float)($r['SpeseAccessorie'] ?? 0);
    //                 if (isset($r['AliquotaIVA'])) $aliquote[] = (string)$r['AliquotaIVA'];
    //                 if (!$riepEsig && !empty($r['EsigibilitaIVA'])) $riepEsig = $r['EsigibilitaIVA'];
    //             }
    //             $aliquotaUniforme = (count(array_unique($aliquote)) === 1) ? ($aliquote[0] ?? null) : null;

    //             // ---- Riga bollo (match su descrizione) ----
    //             $bollo = null;
    //             foreach ($linee as $ln) {
    //                 $descr = isset($ln['Descrizione']) ? mb_strtolower(trim((string)$ln['Descrizione'])) : '';
    //                 if ($descr !== '' && preg_match('/\bbollo\b|marca\s+da\s+bollo|imposta\s+di\s+bollo|rimborso\s+spese\s+di\s+bollo/u', $descr)) {
    //                     $bollo = $ln; break;
    //                 }
    //             }

    //             // ---- CodiceArticolo (sicuro anche se assente) ----
    //             $codArtTipo1 = $codArtVal1 = $codArtTipo2 = $codArtVal2 = null;
    //             if (is_array($firstLine) && !empty($firstLine['CodiceArticolo'])) {
    //                 $codes = $firstLine['CodiceArticolo'];
    //                 // se è assoc -> wrap
    //                 if (isset($codes['CodiceTipo']) || isset($codes['CodiceValore'])) {
    //                     $codes = [$codes];
    //                 }
    //                 $codes = array_values($codes);
    //                 if (isset($codes[0]) && is_array($codes[0])) {
    //                     $codArtTipo1 = $codes[0]['CodiceTipo']   ?? null;
    //                     $codArtVal1  = $codes[0]['CodiceValore'] ?? null;
    //                 }
    //                 if (isset($codes[1]) && is_array($codes[1])) {
    //                     $codArtTipo2 = $codes[1]['CodiceTipo']   ?? null;
    //                     $codArtVal2  = $codes[1]['CodiceValore'] ?? null;
    //                 }
    //             }

    //             // ==== Build array insert (retro-compat completo) ====
    //             $Accounting_array = [
    //                 // Trasmissione
    //                 'ProgressivoInvio'    => $header['DatiTrasmissione']['ProgressivoInvio'] ?? null,
    //                 'FormatoTrasmissione' => $header['DatiTrasmissione']['FormatoTrasmissione'] ?? null,
    //                 'FornitoreIdPaese'    => $idPaese,
    //                 'FornitoreIdCodice'   => $idCodice,

    //                 // Cedente/Prestatore
    //                 'FornitoreCodiceFiscale' => $da['CodiceFiscale'] ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null),
    //                 'FornitoreNome'          => $fornitoreDisplay,
    //                 'FornitoreRegimeFiscale' => $da['RegimeFiscale'] ?? null,

    //                 'FornitoreSedeIndirizzo' => $sede['Indirizzo'] ?? null,
    //                 'FornitoreSedeCAP'       => $sede['CAP'] ?? null,
    //                 'FornitoreSedeComune'    => $sede['Comune'] ?? null,
    //                 'FornitoreSedeProvincia' => $sede['Provincia'] ?? null,
    //                 'FornitoreSedeNazione'   => $sede['Nazione'] ?? null,

    //                 'FornitoreTelefono'      => $cont['Telefono'] ?? null,
    //                 'FornitoreEmail'         => $cont['Email'] ?? null,

    //                 // REA
    //                 'UfficioRea'             => $rea['Ufficio'] ?? null,
    //                 'NumeroRea'              => $rea['NumeroREA'] ?? null,
    //                 'CapitaleSocialeRea'     => $rea['CapitaleSociale'] ?? null,
    //                 'SocioUnicoRea'          => $rea['SocioUnico'] ?? null,
    //                 'StatoLiquidazioneRea'   => $rea['StatoLiquidazione'] ?? null,

    //                 // Documento
    //                 'TipoDocumento'            => $dgd['TipoDocumento'] ?? null,
    //                 'Divisa'                   => $dgd['Divisa'] ?? null,
    //                 'Data'                     => $dgd['Data'] ?? null,
    //                 'Numero'                   => $dgd['Numero'] ?? null,
    //                 'ImportoTotaleDocumento'   => $dgd['ImportoTotaleDocumento'] ?? null,

    //                 // Prima riga (storici)
    //                 'CodiceArticoloTipo1'   => $codArtTipo1,
    //                 'CodiceArticoloValore1' => $codArtVal1,
    //                 'CodiceArticoloTipo2'   => $codArtTipo2,
    //                 'CodiceArticoloValore2' => $codArtVal2,
    //                 'Descrizione'           => $firstLine['Descrizione']    ?? null,
    //                 'Quantita'              => $firstLine['Quantita']       ?? null,
    //                 'UnitaMisura'           => $firstLine['UnitaMisura']    ?? null,
    //                 'PrezzoUnitario'        => $firstLine['PrezzoUnitario'] ?? null,
    //                 'PrezzoTotale'          => $firstLine['PrezzoTotale']   ?? null,
    //                 'AliquotaIVA'           => $firstLine['AliquotaIVA']    ?? null,

    //                 // Riepilogo (storici)
    //                 'RiepilogoAliquotaIVA'       => $aliquotaUniforme,
    //                 'RiepilogoSpeseAccessorie'   => (string)$sumSpeseAcc,
    //                 'RiepilogoImponibileImporto' => (string)$sumImponibile,
    //                 'RiepilogoImposta'           => (string)$sumImposta,
    //                 'RiepilogoEsigibilitaIVA'    => $riepEsig,

    //                 // Pagamenti header (storici)
    //                 'CondizioniPagamento'      => $dp['CondizioniPagamento'] ?? null,
    //                 'ModalitaPagamento1'       => $detPag[0]['ModalitaPagamento']     ?? null,
    //                 'DataScadenzaPagamento1'   => $detPag[0]['DataScadenzaPagamento'] ?? null,
    //                 'ImportoPagamento1'        => $detPag[0]['ImportoPagamento']      ?? null,
    //                 'ModalitaPagamento2'       => $detPag[1]['ModalitaPagamento']     ?? null,
    //                 'DataScadenzaPagamento2'   => $detPag[1]['DataScadenzaPagamento'] ?? null,
    //                 'ImportoPagamento2'        => $detPag[1]['ImportoPagamento']      ?? null,

    //                 // Tracking
    //                 'Stato'         => 'aperta',
    //                 'xml_originale' => $xmlString,
    //                 'imported_at'   => now(),
    //             ];

    //             // --- Riga bollo -> campi migration ---
    //             if ($bollo) {
    //                 $Accounting_array['BolloLineaNumero']      = isset($bollo['NumeroLinea']) ? (int)$bollo['NumeroLinea'] : null;
    //                 $Accounting_array['BolloLineaDescrizione'] = $bollo['Descrizione'] ?? null;
    //                 $Accounting_array['BolloPrezzoUnitario']   = $toFloat($bollo['PrezzoUnitario'] ?? null);
    //                 $Accounting_array['BolloPrezzoTotale']     = $toFloat($bollo['PrezzoTotale'] ?? null);
    //                 $Accounting_array['BolloAliquotaIVA']      = $toFloat($bollo['AliquotaIVA'] ?? null);
    //                 $Accounting_array['BolloNatura']           = $bollo['Natura'] ?? null;

    //                 Log::info("🧾 [$fileName] Riga bollo rilevata", [
    //                     'Numero'      => $Accounting_array['BolloLineaNumero'],
    //                     'Descrizione' => $Accounting_array['BolloLineaDescrizione'],
    //                     'PrezzoTotale'=> $Accounting_array['BolloPrezzoTotale'],
    //                     'AliquotaIVA' => $Accounting_array['BolloAliquotaIVA'],
    //                     'Natura'      => $Accounting_array['BolloNatura'],
    //                 ]);
    //             }

    //             // --- Segno coerente su TD04 ---
    //             $rawTotal = (float)($Accounting_array['ImportoTotaleDocumento'] ?? 0);
    //             $isCredit = in_array($Accounting_array['TipoDocumento'], self::CREDIT_NOTE_TYPES, true);
    //             $Accounting_array['ImportoTotaleDocumento'] = $isCredit ? -abs($rawTotal) : abs($rawTotal);

    //             // --- Obbligatorio minimo ---
    //             if (empty($Accounting_array['ProgressivoInvio'])) {
    //                 throw new \Exception("Campo obbligatorio mancante: ProgressivoInvio");
    //             }

    //             // --- Progressivo auto (MAX + 1) se assente ---
    //             if (empty($Accounting_array['Progressivo'])) {
    //                 $max = Accounting::whereNotNull('Progressivo')
    //                     ->selectRaw('MAX(CAST(Progressivo AS UNSIGNED)) as m')
    //                     ->value('m');
    //                 $Accounting_array['Progressivo'] = (string)((int)($max ?? 0) + 1);
    //             }

    //             // --- Log campi mancanti/empty (solo warning) ---
    //             $campiVuoti = [];
    //             foreach ($Accounting_array as $k => $v) {
    //                 if ($v === null || (is_string($v) && trim($v) === '')) {
    //                     $campiVuoti[] = $k;
    //                 }
    //             }
    //             if (!empty($campiVuoti)) {
    //                 Log::warning("⚠️ [$fileName] Campi mancanti/empty: " . implode(', ', $campiVuoti));
    //             }

    //             // --- Salva testata ---
    //             $savedAccounting = Accounting::create($Accounting_array);

    //             // --- Dettaglio pagamenti ---
    //             foreach ($detPag as $pagamento) {
    //                 $mp = $pagamento['ModalitaPagamento'] ?? null;
    //                 $tipo = match ($mp) {
    //                     'MP05' => 'bonifico',
    //                     'MP12', 'MP13' => 'riba',
    //                     'MP01' => 'contanti',
    //                     'MP02', 'MP03' => 'assegno',
    //                     default => null,
    //                 };

    //                 DB::table('detail_accountings')->insert([
    //                     'accountingId'          => $savedAccounting->id,
    //                     'modalitaPagamento'     => $mp,
    //                     'dataScadenzaPagamento' => $pagamento['DataScadenzaPagamento'] ?? null,
    //                     'importoPagamento'      => isset($pagamento['ImportoPagamento']) ? (float)$pagamento['ImportoPagamento'] : null,
    //                     'stato'                 => 'aperta',
    //                     'tipoPagamento'         => $tipo,
    //                     'note'                  => null,
    //                 ]);
    //             }

    //             Log::info("✅ [$fileName] Importazione riuscita.");
    //             $importSuccess++;

    //         } catch (\Throwable $e) {
    //             Log::error("❌ [$fileName] Errore: " . $e->getMessage());
    //             $importErrors[] = ['file' => $fileName, 'error' => $e->getMessage()];
    //         }
    //     }

    //     return redirect()
    //         ->route('accounting.index')
    //         ->with('success', "$importSuccess fatture importate.")
    //         ->with('import_errors', $importErrors);
    // }



    // App\Http\Controllers\AccountingController.php

    public function show(Accounting $accounting)
    {
        $accounting->load(['detailAccounting' => fn($q) => $q->orderBy('dataScadenzaPagamento')]);

        return inertia('Accounting/Show', [
            // passo direttamente il Model per avere *tutti* i campi
            'accounting' => $accounting,
            'backQuery'  => request()->query() ?: null,
        ]);
    }



    /*  public function show(Accounting $accounting)
    {
        return inertia("Accounting/Import");
    } */

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


    public function downloadXml(Accounting $accounting)
    {
        abort_unless($accounting->xml_originale, 404, 'XML non disponibile');

        $filename = 'fattura_' . $accounting->id . '.xml';

        return response()->streamDownload(
            function () use ($accounting) {
                echo $accounting->xml_originale;
            },
            $filename,
            [
                'Content-Type'              => 'application/xml; charset=UTF-8',
                'Content-Disposition'       => 'attachment; filename="' . $filename . '"',
                'X-Content-Type-Options'    => 'nosniff',
                'Cache-Control'             => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma'                    => 'no-cache',
                'Expires'                   => '0',
            ]
        );
    }
}
