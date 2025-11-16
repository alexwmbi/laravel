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

    /** Lunghezza massima colonna Descrizione in DB */
    private const DESCRIZIONE_MAX_LENGTH = 255;

    /**
     * Normalizza la codifica dell'XML in UTF-8.
     */
    private function normalizeXmlEncoding(string $xml): string
    {
        if (preg_match('/<\?xml[^>]*encoding="([^"]+)"/i', $xml, $m)) {
            $encoding = strtoupper(trim($m[1]));

            if ($encoding !== 'UTF-8') {
                try {
                    $xml = mb_convert_encoding($xml, 'UTF-8', $encoding);

                    $xml = preg_replace(
                        '/(<\?xml[^>]*encoding=")[^"]+(")/i',
                        '$1UTF-8$2',
                        $xml,
                        1
                    );
                } catch (\Throwable $e) {
                    Log::warning("⚠️ Errore conversione XML da {$encoding} a UTF-8: " . $e->getMessage());
                }
            }
        } else {
            if (!mb_check_encoding($xml, 'UTF-8')) {
                try {
                    $xml = mb_convert_encoding($xml, 'UTF-8', 'Windows-1252');
                } catch (\Throwable $e) {
                    Log::warning("⚠️ Errore conversione XML non UTF-8 (fallback Windows-1252): " . $e->getMessage());
                }
            }
        }

        return $xml;
    }

    /**
     * Appiattisce un valore XML complesso in una stringa.
     */
    private function flattenXmlValue($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (!is_array($value)) {
            return is_scalar($value) ? (string) $value : json_encode($value);
        }

        $flat = [];
        $it   = new \RecursiveIteratorIterator(new \RecursiveArrayIterator($value));

        foreach ($it as $v) {
            if (is_scalar($v)) {
                $flat[] = (string) $v;
            }
        }

        return $flat ? implode(' | ', $flat) : null;
    }

    /**
     * Ricerca duplicati di una fattura già presente a sistema.
     */
    private function findExistingAccountingDuplicate(array $accountingData, string $xmlString): ?Accounting
    {
        $progressivoInvio    = $accountingData['ProgressivoInvio']       ?? null;
        $fornitoreIdPaese    = $accountingData['FornitoreIdPaese']       ?? null;
        $fornitoreIdCodice   = $accountingData['FornitoreIdCodice']      ?? null;
        $fornitoreCodFiscale = $accountingData['FornitoreCodiceFiscale'] ?? null;
        $numero              = $accountingData['Numero']                 ?? null;
        $dataDocumento       = $accountingData['Data']                   ?? null;

        $query      = Accounting::query();
        $hasCriteria = false;

        // 1) ProgressivoInvio + fornitore
        if (!empty($progressivoInvio)) {
            $hasCriteria = true;
            $query->orWhere(function ($q) use (
                $progressivoInvio,
                $fornitoreIdPaese,
                $fornitoreIdCodice,
                $fornitoreCodFiscale
            ) {
                $q->where('ProgressivoInvio', $progressivoInvio);

                if (!empty($fornitoreIdPaese)) {
                    $q->where('FornitoreIdPaese', $fornitoreIdPaese);
                }
                if (!empty($fornitoreIdCodice)) {
                    $q->where('FornitoreIdCodice', $fornitoreIdCodice);
                }
                if (!empty($fornitoreCodFiscale)) {
                    $q->where('FornitoreCodiceFiscale', $fornitoreCodFiscale);
                }
            });
        }

        // 2) Numero + Data + fornitore
        if (!empty($numero) && !empty($dataDocumento)) {
            $hasCriteria = true;
            $query->orWhere(function ($q) use (
                $numero,
                $dataDocumento,
                $fornitoreCodFiscale,
                $fornitoreIdCodice,
                $fornitoreIdPaese
            ) {
                $q->where('Numero', $numero)
                    ->whereDate('Data', $dataDocumento);

                if (!empty($fornitoreCodFiscale)) {
                    $q->where('FornitoreCodiceFiscale', $fornitoreCodFiscale);
                } elseif (!empty($fornitoreIdCodice)) {
                    $q->where('FornitoreIdCodice', $fornitoreIdCodice);
                    if (!empty($fornitoreIdPaese)) {
                        $q->where('FornitoreIdPaese', $fornitoreIdPaese);
                    }
                }
            });
        }

        if ($hasCriteria) {
            $duplicate = $query->first();
            if ($duplicate) {
                return $duplicate;
            }
        }

        // 3) Hash SHA1 dell'intero XML
        $xmlHash = sha1($xmlString);

        $row = DB::table('accountings')
            ->select('id')
            ->whereRaw('SHA1(`xml_originale`) = ?', [$xmlHash])
            ->first();

        if ($row && isset($row->id)) {
            return Accounting::find($row->id);
        }

        return null;
    }

    public function index(Request $request)
    {
        // ===== 1) Base query con filtri =====
        $base = Accounting::query();

        // Stato (header)
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

        // Data documento (da / a)
        if ($request->filled('date_from')) {
            $base->whereDate('Data', '>=', $request->date('date_from')->format('Y-m-d'));
        }
        if ($request->filled('date_to')) {
            $base->whereDate('Data', '<=', $request->date('date_to')->format('Y-m-d'));
        }

        // 🔎 NUOVI filtri: data scadenza pagamento (righe dettaglio)
        if ($request->filled('due_from')) {
            $base->whereHas('detailAccounting', function ($q) use ($request) {
                $q->whereDate(
                    'dataScadenzaPagamento',
                    '>=',
                    $request->date('due_from')->format('Y-m-d')
                );
            });
        }

        if ($request->filled('due_to')) {
            $base->whereHas('detailAccounting', function ($q) use ($request) {
                $q->whereDate(
                    'dataScadenzaPagamento',
                    '<=',
                    $request->date('due_to')->format('Y-m-d')
                );
            });
        }

        // Tipo documento (TD01 fattura, TD04 nota di credito)
        if ($request->filled('tipo_documento')) {
            $base->where('TipoDocumento', '=', $request->string('tipo_documento'));
        }

        // ===== 2) Totali con gli stessi filtri header (base) =====
        $count = (clone $base)->count();

        // Totale documenti con segno coerente al tipo
        $sumDocs = (clone $base)->selectRaw("
            COALESCE(SUM(
                CASE
                  WHEN TipoDocumento IN ('TD04') THEN -ABS(ImportoTotaleDocumento)
                  ELSE ABS(ImportoTotaleDocumento)
                END
            ), 0) as s
        ")->value('s');

        // Pagato con segno coerente (le NC sottraggono)
        $filteredIdsSub = (clone $base)->select('id');

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

        $sumDue = (float) $sumDocs - (float) $sumPaid;

        $totals = [
            'count'    => (int) $count,
            'sum_docs' => (float) $sumDocs,
            'sum_paid' => (float) $sumPaid,
            'sum_due'  => (float) $sumDue,
        ];

        // ===== 3) Listing con ordinamento/paginazione =====
        $tableQuery = (clone $base)
            ->with(['detailAccounting' => fn ($q) => $q->orderBy('dataScadenzaPagamento')]);

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
        } else {
            // ordinamento normale sugli altri campi
            $tableQuery->orderBy($sortField, $sortDirection);
        }

        $accountings = $tableQuery
            ->paginate(10)
            ->appends($request->query());

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

        $batchSeenLogicalKeys = [];
        $batchSeenXmlHashes   = [];

        foreach ($files as $file) {
            $fileName = $file->getClientOriginalName();
            Log::info("🔁 Inizio elaborazione file: $fileName");

            try {
                $xmlString = file_get_contents($file);
                $xmlString = $this->normalizeXmlEncoding($xmlString);

                $xmlObject = simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOCDATA);
                if ($xmlObject === false) {
                    throw new \Exception("XML non valido");
                }

                $arr = json_decode(json_encode($xmlObject), true);

                $first = function ($val) {
                    return (is_array($val) && array_key_exists(0, $val)) ? $val[0] : $val;
                };
                $asArray = function ($val) {
                    if ($val === null) return [];
                    if (is_array($val) && array_key_exists(0, $val)) return $val;
                    return [$val];
                };
                $toFloat = function ($v) {
                    if ($v === null || $v === '') return null;
                    $s = trim((string) $v);
                    if (str_contains($s, '.') && str_contains($s, ',')) {
                        $s = str_replace('.', '', $s);
                        $s = str_replace(',', '.', $s);
                    } elseif (str_contains($s, ',') && !str_contains($s, '.')) {
                        $s = str_replace(',', '.', $s);
                    }
                    return is_numeric($s) ? (float) $s : null;
                };

                $header = $arr['FatturaElettronicaHeader'] ?? [];
                $bodies = $asArray($arr['FatturaElettronicaBody'] ?? []);
                $body   = $first($bodies);
                $body   = is_array($body) ? $body : [];

                $dpAll  = $asArray($body['DatiPagamento'] ?? []);
                $dp     = $first($dpAll);
                $dp     = is_array($dp) ? $dp : [];
                $detPag = $asArray($dp['DettaglioPagamento'] ?? []);

                $ced  = $header['CedentePrestatore'] ?? [];
                $da   = $ced['DatiAnagrafici'] ?? [];
                $ana  = $da['Anagrafica'] ?? [];
                $sede = $ced['Sede'] ?? ($ced['StabileOrganizzazione'] ?? []);
                $cont = $ced['Contatti'] ?? [];
                $rea  = $ced['IscrizioneREA'] ?? [];

                $den  = isset($ana['Denominazione']) ? trim((string) $ana['Denominazione']) : '';
                $nome = isset($ana['Nome']) ? trim((string) $ana['Nome']) : '';
                $cogn = isset($ana['Cognome']) ? trim((string) $ana['Cognome']) : '';
                $fornitoreDisplay = $den !== '' ? $den : (trim($nome . ' ' . $cogn) ?: null);

                $idPaese  = $header['DatiTrasmissione']['IdTrasmittente']['IdPaese']
                    ?? ($da['IdFiscaleIVA']['IdPaese'] ?? null);
                $idCodice = $header['DatiTrasmissione']['IdTrasmittente']['IdCodice']
                    ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null);

                $dgd = $body['DatiGenerali']['DatiGeneraliDocumento'] ?? [];

                $rawCausale = $dgd['Causale'] ?? null;
                if (is_array($rawCausale)) {
                    $rawCausale = implode("\n", array_map(fn ($s) => is_scalar($s) ? (string) $s : json_encode($s), $rawCausale));
                } elseif (!is_null($rawCausale) && !is_scalar($rawCausale)) {
                    $rawCausale = json_encode($rawCausale);
                }

                $dbs       = $body['DatiBeniServizi'] ?? [];
                $linee     = $asArray($dbs['DettaglioLinee'] ?? []);
                $firstLine = $first($linee) ?? null;
                $firstLine = is_array($firstLine) ? $firstLine : [];

                $riep = $asArray($dbs['DatiRiepilogo'] ?? []);
                $sumImponibile = 0.0;
                $sumImposta    = 0.0;
                $sumSpeseAcc   = 0.0;
                $aliquote      = [];
                $riepEsig      = null;

                foreach ($riep as $r) {
                    $sumImponibile += (float) ($r['ImponibileImporto'] ?? 0);
                    $sumImposta    += (float) ($r['Imposta'] ?? 0);
                    $sumSpeseAcc   += (float) ($r['SpeseAccessorie'] ?? 0);
                    if (isset($r['AliquotaIVA'])) {
                        $aliquote[] = (string) $r['AliquotaIVA'];
                    }
                    if (!$riepEsig && !empty($r['EsigibilitaIVA'])) {
                        $riepEsig = $r['EsigibilitaIVA'];
                    }
                }

                $aliquotaUniforme = (count(array_unique($aliquote)) === 1) ? ($aliquote[0] ?? null) : null;

                $bollo = null;
                foreach ($linee as $ln) {
                    $descr = isset($ln['Descrizione']) ? mb_strtolower(trim((string) $ln['Descrizione'])) : '';
                    if (
                        $descr !== '' &&
                        preg_match(
                            '/\bbollo\b|marca\s+da\s+bollo|imposta\s+di\s+bollo|rimborso\s+spese\s+di\s+bollo/u',
                            $descr
                        )
                    ) {
                        $bollo = $ln;
                        break;
                    }
                }

                $codArtTipo1 = $codArtVal1 = $codArtTipo2 = $codArtVal2 = null;
                if (!empty($firstLine['CodiceArticolo'])) {
                    $codes = $firstLine['CodiceArticolo'];
                    if (isset($codes['CodiceTipo']) || isset($codes['CodiceValore'])) {
                        $codes = [$codes];
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

                $descrizioneLinea = $firstLine['Descrizione'] ?? null;
                if (is_array($descrizioneLinea)) {
                    $descrizioneLinea = $this->flattenXmlValue($descrizioneLinea);
                }
                if (is_string($descrizioneLinea)) {
                    $descrizioneLinea = trim($descrizioneLinea);
                    $len = mb_strlen($descrizioneLinea);
                    if ($len > self::DESCRIZIONE_MAX_LENGTH) {
                        Log::warning("⚠️ [$fileName] Descrizione troppo lunga ({$len} chars), troncata a " . self::DESCRIZIONE_MAX_LENGTH . ".");
                        $descrizioneLinea = mb_substr($descrizioneLinea, 0, self::DESCRIZIONE_MAX_LENGTH);
                    }
                }

                $Accounting_array = [
                    'ProgressivoInvio'    => $header['DatiTrasmissione']['ProgressivoInvio'] ?? null,
                    'FormatoTrasmissione' => $header['DatiTrasmissione']['FormatoTrasmissione'] ?? null,
                    'FornitoreIdPaese'    => $idPaese,
                    'FornitoreIdCodice'   => $idCodice,

                    'FornitoreCodiceFiscale' => $da['CodiceFiscale'] ?? ($da['IdFiscaleIVA']['IdCodice'] ?? null),
                    'FornitoreNome'          => $fornitoreDisplay,

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

                    'TipoDocumento'          => $dgd['TipoDocumento'] ?? null,
                    'Divisa'                 => $dgd['Divisa'] ?? null,
                    'Data'                   => $dgd['Data'] ?? null,
                    'Numero'                 => $dgd['Numero'] ?? null,
                    'ImportoTotaleDocumento' => $dgd['ImportoTotaleDocumento'] ?? null,

                    'CodiceArticoloTipo1'   => $codArtTipo1,
                    'CodiceArticoloValore1' => $codArtVal1,
                    'CodiceArticoloTipo2'   => $codArtTipo2,
                    'CodiceArticoloValore2' => $codArtVal2,
                    'Descrizione'           => $descrizioneLinea,
                    'Quantita'              => $firstLine['Quantita']       ?? null,
                    'UnitaMisura'           => $firstLine['UnitaMisura']    ?? null,
                    'PrezzoUnitario'        => $firstLine['PrezzoUnitario'] ?? null,
                    'PrezzoTotale'          => $firstLine['PrezzoTotale']   ?? null,
                    'AliquotaIVA'           => $firstLine['AliquotaIVA']    ?? null,

                    'RiepilogoAliquotaIVA'       => $aliquotaUniforme,
                    'RiepilogoSpeseAccessorie'   => (string) $sumSpeseAcc,
                    'RiepilogoImponibileImporto' => (string) $sumImponibile,
                    'RiepilogoImposta'           => (string) $sumImposta,
                    'RiepilogoEsigibilitaIVA'    => $riepEsig,

                    'CondizioniPagamento'    => $dp['CondizioniPagamento'] ?? null,
                    'ModalitaPagamento1'     => $detPag[0]['ModalitaPagamento']     ?? null,
                    'DataScadenzaPagamento1' => $detPag[0]['DataScadenzaPagamento'] ?? null,
                    'ImportoPagamento1'      => $detPag[0]['ImportoPagamento']      ?? null,
                    'ModalitaPagamento2'     => $detPag[1]['ModalitaPagamento']     ?? null,
                    'DataScadenzaPagamento2' => $detPag[1]['DataScadenzaPagamento'] ?? null,
                    'ImportoPagamento2'      => $detPag[1]['ImportoPagamento']      ?? null,

                    'Stato'         => 'aperta',
                    'xml_originale' => $xmlString,
                    'imported_at'   => now(),
                    'Note'          => $rawCausale ?: null,
                ];

                $existing = $this->findExistingAccountingDuplicate($Accounting_array, $xmlString);
                if ($existing) {
                    Log::warning("⛔ [$fileName] Fattura già importata (id={$existing->id}). Import saltato.");

                    $importErrors[] = [
                        'file'  => $fileName,
                        'error' => "Fattura già presente a sistema (id {$existing->id}). Importazione ignorata.",
                    ];

                    continue;
                }

                $batchKeys = [];

                if (!empty($Accounting_array['ProgressivoInvio'])) {
                    $batchKeys[] = 'PI|' . $Accounting_array['ProgressivoInvio']
                        . '|' . ($Accounting_array['FornitoreIdPaese'] ?? '')
                        . '|' . ($Accounting_array['FornitoreIdCodice'] ?? '')
                        . '|' . ($Accounting_array['FornitoreCodiceFiscale'] ?? '');
                }

                if (!empty($Accounting_array['Numero']) && !empty($Accounting_array['Data'])) {
                    $batchKeys[] = 'ND|' . $Accounting_array['Numero']
                        . '|' . $Accounting_array['Data']
                        . '|' . ($Accounting_array['FornitoreCodiceFiscale'] ?? ($Accounting_array['FornitoreIdCodice'] ?? ''))
                        . '|' . ($Accounting_array['FornitoreIdPaese'] ?? '');
                }

                $xmlHash         = sha1($xmlString);
                $isBatchDuplicate = false;

                foreach ($batchKeys as $k) {
                    if (!empty($k) && isset($batchSeenLogicalKeys[$k])) {
                        $isBatchDuplicate = true;
                        break;
                    }
                }

                if (!$isBatchDuplicate && isset($batchSeenXmlHashes[$xmlHash])) {
                    $isBatchDuplicate = true;
                }

                if ($isBatchDuplicate) {
                    Log::warning("⛔ [$fileName] Fattura duplicata all'interno dello stesso batch. Import saltato.");

                    $importErrors[] = [
                        'file'  => $fileName,
                        'error' => "Fattura duplicata all'interno di questo import multiplo. Importazione ignorata.",
                    ];

                    continue;
                }

                foreach ($batchKeys as $k) {
                    if (!empty($k)) {
                        $batchSeenLogicalKeys[$k] = true;
                    }
                }
                $batchSeenXmlHashes[$xmlHash] = true;

                if ($bollo) {
                    $Accounting_array['BolloLineaNumero']      = isset($bollo['NumeroLinea']) ? (int) $bollo['NumeroLinea'] : null;
                    $Accounting_array['BolloLineaDescrizione'] = $bollo['Descrizione'] ?? null;
                    $Accounting_array['BolloPrezzoUnitario']   = $toFloat($bollo['PrezzoUnitario'] ?? null);
                    $Accounting_array['BolloPrezzoTotale']     = $toFloat($bollo['PrezzoTotale'] ?? null);
                    $Accounting_array['BolloAliquotaIVA']      = $toFloat($bollo['AliquotaIVA'] ?? null);
                    $Accounting_array['BolloNatura']           = $bollo['Natura'] ?? null;

                    Log::info("🧾 [$fileName] Riga bollo rilevata", [
                        'Numero'       => $Accounting_array['BolloLineaNumero'],
                        'Descrizione'  => $Accounting_array['BolloLineaDescrizione'],
                        'PrezzoTotale' => $Accounting_array['BolloPrezzoTotale'],
                        'AliquotaIVA'  => $Accounting_array['BolloAliquotaIVA'],
                        'Natura'       => $Accounting_array['BolloNatura'],
                    ]);
                }

                $rawTotal = (float) ($Accounting_array['ImportoTotaleDocumento'] ?? 0);
                $isCredit = in_array($Accounting_array['TipoDocumento'], self::CREDIT_NOTE_TYPES, true);
                $Accounting_array['ImportoTotaleDocumento'] = $isCredit ? -abs($rawTotal) : abs($rawTotal);

                if (empty($Accounting_array['ProgressivoInvio'])) {
                    throw new \Exception("Campo obbligatorio mancante: ProgressivoInvio");
                }

                if (empty($Accounting_array['Progressivo'])) {
                    $yy = now('Europe/Rome')->format('y');

                    $max = Accounting::whereRaw("`Progressivo` REGEXP ?", ["^[0-9]+_{$yy}$"])
                        ->selectRaw("MAX(CAST(SUBSTRING_INDEX(`Progressivo`, '_', 1) AS UNSIGNED)) as m")
                        ->value('m');

                    $next                          = ((int) ($max ?? 0)) + 1;
                    $Accounting_array['Progressivo'] = $next . '_' . $yy;
                }

                foreach ($Accounting_array as $key => $value) {
                    if (is_array($value)) {
                        Log::warning("⚠️ [$fileName] Campo {$key} è array, verrà serializzato in stringa.");
                        $Accounting_array[$key] = $this->flattenXmlValue($value);
                    }
                }

                $campiVuoti = [];
                foreach ($Accounting_array as $k => $v) {
                    if ($v === null || (is_string($v) && trim($v) === '')) {
                        $campiVuoti[] = $k;
                    }
                }
                if (!empty($campiVuoti)) {
                    Log::warning("⚠️ [$fileName] Campi mancanti/empty: " . implode(', ', $campiVuoti));
                }

                $savedAccounting = Accounting::create($Accounting_array);

                foreach ($detPag as $pagamento) {
                    $mp = $pagamento['ModalitaPagamento'] ?? null;

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
                        'importoPagamento'      => isset($pagamento['ImportoPagamento']) ? (float) $pagamento['ImportoPagamento'] : null,
                        'stato'                 => 'aperta',
                        'tipoPagamento'         => $tipo,
                        'note'                  => null,
                    ]);
                }

                Log::info("✅ [$fileName] Importazione riuscita.");
                $importSuccess++;
            } catch (\Throwable $e) {
                Log::error("❌ [$fileName] Errore: " . $e->getMessage());
                $importErrors[] = [
                    'file'  => $fileName,
                    'error' => $e->getMessage(),
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
        $accounting->load(['detailAccounting' => fn ($q) => $q->orderBy('dataScadenzaPagamento')]);

        return inertia('Accounting/Show', [
            'accounting' => $accounting,
            'backQuery'  => request()->query() ?: null,
        ]);
    }

    public function edit(Accounting $accounting)
    {
        $accounting->load(['detailAccounting' => fn ($q) => $q->orderBy('dataScadenzaPagamento')]);

        return inertia('Accounting/Edit', [
            'accounting'        => new AccountingResource($accounting),
            'detailAccountings' => $accounting->detailAccounting->map(function ($d) {
                return [
                    'id'                  => $d->id,
                    'accountingId'        => $d->accountingId,
                    'stato'               => $d->stato,
                    'modalitaPagamento'   => $d->modalitaPagamento,
                    'tipoPagamento'       => $d->tipoPagamento,
                    'dataScadenzaPagamento' => $d->dataScadenzaPagamento,
                    'importoPagamento'    => $d->importoPagamento,
                    'note'                => $d->note,
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

        $query = $request->query();

        return redirect()
            ->route('accounting.index', $query)
            ->with('success', 'Progressivo modificato');
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

    public function patchField(Request $request, Accounting $accounting)
    {
        $data = $request->validate([
            'Progressivo'            => ['sometimes', 'nullable', 'string'],
            'ProgressivoInvio'       => ['sometimes', 'nullable', 'string'],
            'FornitoreNome'          => ['sometimes', 'nullable', 'string'],
            'Numero'                 => ['sometimes', 'nullable', 'string'],
            'Data'                   => ['sometimes', 'nullable', 'date'],
            'ImportoTotaleDocumento' => ['sometimes', 'nullable', 'numeric'],
            'TipoDocumento'          => ['sometimes', 'required', 'in:TD01,TD04'],
            'Stato'                  => ['sometimes', 'required', 'in:aperta,pagata,parziale'],
            'Note'                   => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $tipo    = $data['TipoDocumento'] ?? $accounting->TipoDocumento;
        $isCredit = in_array($tipo, self::CREDIT_NOTE_TYPES, true);

        if (array_key_exists('ImportoTotaleDocumento', $data) && $data['ImportoTotaleDocumento'] !== null) {
            $amount = abs((float) $data['ImportoTotaleDocumento']);
            $data['ImportoTotaleDocumento'] = $isCredit ? -$amount : $amount;
        }

        $accounting->update($data);

        if (!array_key_exists('ImportoTotaleDocumento', $data) && array_key_exists('TipoDocumento', $data)) {
            $amount = abs((float) $accounting->ImportoTotaleDocumento);
            $accounting->update([
                'ImportoTotaleDocumento' => $isCredit ? -$amount : $amount,
            ]);
        }

        return back()->with('success', 'Fattura aggiornata');
    }

    // === CRUD righe pagamento
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

    public function editDetail(DetailAccounting $detail)
    {
        $detail->loadMissing('accounting');

        return inertia('DetailAccounting/Edit', [
            'detailAccounting' => [
                'id'                  => $detail->id,
                'accountingId'        => $detail->accountingId,
                'stato'               => $detail->stato,
                'modalitaPagamento'   => $detail->modalitaPagamento,
                'tipoPagamento'       => $detail->tipoPagamento,
                'dataScadenzaPagamento' => $detail->dataScadenzaPagamento,
                'importoPagamento'    => $detail->importoPagamento,
                'note'                => $detail->note,
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
                'Content-Type'        => 'application/xml; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control'       => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma'              => 'no-cache',
                'Expires'             => '0',
            ]
        );
    }
}
