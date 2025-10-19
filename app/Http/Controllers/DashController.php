<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkResource;
use App\Models\Work;
use App\Models\Accounting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashController extends Controller
{
    // Nota: usiamo segno negativo per le note di credito (TD04)
    private const CREDIT_NOTE_TYPES = ['TD04'];
    // Se vuoi limitare i codici selezionabili nel filtro:
    private const ALLOWED_DOC_TYPES = ['TD01','TD24','TD04'];

    public function index(Request $request)
    {
        // ===== LAVORI: filtri + ordinamento =====
        $workQuery = Work::query()
            ->where('status', 'active')
            ->whereDate('starting_date', '>', today());

        // Filtri lista lavori (name/note)
        $name = trim((string) $request->input('name', ''));
        if ($name !== '') {
            $workQuery->where('name', 'like', "%{$name}%");
        }

        $note = trim((string) $request->input('note', ''));
        if ($note !== '') {
            $workQuery->where(function ($q) use ($note) {
                $q->where('note', 'like', "%{$note}%")
                  ->orWhere('note1', 'like', "%{$note}%");
            });
        }

        // Ordinamento
        $allowedSort = ['name', 'starting_date'];
        $sortField   = in_array($request->input('sort_field'), $allowedSort, true) ? $request->input('sort_field') : 'name';
        $sortDir     = strtolower((string)$request->input('sort_direction')) === 'asc' ? 'asc' : 'desc';
        $workQuery->orderBy($sortField, $sortDir);

        $works = $workQuery->paginate(10)->appends($request->query());

        // ===== CONTABILITÀ: pannello riepilogativo (acc_*) =====
        $accBase = Accounting::query();

        // Stato pagamento
        $accStato = trim((string) $request->input('acc_stato', ''));
        if ($accStato !== '') {
            $accBase->whereRaw('LOWER(`Stato`) = ?', [strtolower($accStato)]);
        }

        // Fornitore
        $accName = trim((string) $request->input('acc_name', $request->input('acc_nome', '')));
        if ($accName !== '') {
            $accBase->where('FornitoreNome', 'like', "%{$accName}%");
        }

        // Date
        $accFrom = $request->input('acc_date_from');
        if (!empty($accFrom)) {
            $accBase->whereDate('Data', '>=', date('Y-m-d', strtotime($accFrom)));
        }
        $accTo = $request->input('acc_date_to');
        if (!empty($accTo)) {
            $accBase->whereDate('Data', '<=', date('Y-m-d', strtotime($accTo)));
        }

        // Tipo documento (TDxx) — opzionale
        $accDocType = $request->input('acc_tipo_documento');
        if (is_string($accDocType) && in_array($accDocType, self::ALLOWED_DOC_TYPES, true)) {
            $accBase->where('TipoDocumento', $accDocType);
        }

        // ===== Totali con segno (NC negative) =====
        $cnList = implode("','", self::CREDIT_NOTE_TYPES);

        // Conteggio
        $accCount = (clone $accBase)->count();

        // Somma documenti (con CAST perché la colonna è VARCHAR)
        $accSumDocs = (clone $accBase)->selectRaw("
            COALESCE(SUM(
              CASE
                WHEN TipoDocumento IN ('{$cnList}')
                  THEN -ABS(CAST(ImportoTotaleDocumento AS DECIMAL(18,2)))
                ELSE  ABS(CAST(ImportoTotaleDocumento AS DECIMAL(18,2)))
              END
            ), 0) as s
        ")->value('s');

        // Somma pagato sulle righe 'pagata' con segno coerente
        $filteredIdsSub = (clone $accBase)->select('id');
        $accSumPaid = DB::table('detail_accountings as d')
            ->joinSub($filteredIdsSub, 'a', 'd.accountingId', '=', 'a.id')
            ->join('accountings as h', 'h.id', '=', 'd.accountingId')
            ->where('d.stato', '=', 'pagata')
            ->selectRaw("
                COALESCE(SUM(
                  CASE
                    WHEN h.TipoDocumento IN ('{$cnList}')
                      THEN -ABS(COALESCE(d.importoPagamento,0))
                    ELSE  ABS(COALESCE(d.importoPagamento,0))
                  END
                ), 0) as s
            ")
            ->value('s');

        $accSumDue = (float)$accSumDocs - (float)$accSumPaid;

        $accTotals = [
            'count'    => (int) $accCount,
            'sum_docs' => (float) $accSumDocs,
            'sum_paid' => (float) $accSumPaid,
            'sum_due'  => (float) $accSumDue,
        ];

        // Parametri attuali dei filtri acc_* (per la UI)
        $accQuery = [
            'acc_name'          => $request->query('acc_name'),
            'acc_date_from'     => $request->query('acc_date_from'),
            'acc_date_to'       => $request->query('acc_date_to'),
            'acc_stato'         => $request->query('acc_stato'),
            'acc_tipo_documento'=> $request->query('acc_tipo_documento'), // ⬅️ nuovo
        ];

        return inertia('Dash/Index', [
            'works'       => WorkResource::collection($works),
            'queryParams' => $request->query() ?: null,
            'accTotals'   => $accTotals,
            'accQuery'    => $accQuery,
        ]);
    }
}
