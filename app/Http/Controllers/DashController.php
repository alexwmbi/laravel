<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkResource;
use App\Models\Work;
use App\Models\Accounting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashController extends Controller
{
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

        $accStato = trim((string) $request->input('acc_stato', ''));
        if ($accStato !== '') {
            $accBase->whereRaw('LOWER(`Stato`) = ?', [strtolower($accStato)]);
        }

        $accName = trim((string) $request->input('acc_name', $request->input('acc_nome', '')));
        if ($accName !== '') {
            $accBase->where('FornitoreNome', 'like', "%{$accName}%");
        }

        $accFrom = $request->input('acc_date_from');
        if (!empty($accFrom)) {
            $accBase->whereDate('Data', '>=', date('Y-m-d', strtotime($accFrom)));
        }

        $accTo = $request->input('acc_date_to');
        if (!empty($accTo)) {
            $accBase->whereDate('Data', '<=', date('Y-m-d', strtotime($accTo)));
        }

        // Totali
        $accCount   = (clone $accBase)->count();
        $accSumDocs = (clone $accBase)->sum('ImportoTotaleDocumento');

        $filteredIdsSub = (clone $accBase)->select('id');
        $accSumPaid = DB::table('detail_accountings')
            ->joinSub($filteredIdsSub, 'a', 'detail_accountings.accountingId', '=', 'a.id')
            ->where('detail_accountings.stato', '=', 'pagata')
            ->sum('detail_accountings.importoPagamento');

        $accSumDue = max(0, (float)$accSumDocs - (float)$accSumPaid);

        $accTotals = [
            'count'    => (int) $accCount,
            'sum_docs' => (float) $accSumDocs,
            'sum_paid' => (float) $accSumPaid,
            'sum_due'  => (float) $accSumDue,
        ];

        // Parametri attuali dei filtri acc_* (per la UI)
        $accQuery = [
            'acc_name'      => $request->query('acc_name'),
            'acc_date_from' => $request->query('acc_date_from'),
            'acc_date_to'   => $request->query('acc_date_to'),
            'acc_stato'     => $request->query('acc_stato'),
        ];

        return inertia('Dash/Index', [
            'works'       => WorkResource::collection($works),
            'queryParams' => $request->query() ?: null, // contiene name/note/sort/page + eventuali acc_*
            'accTotals'   => $accTotals,
            'accQuery'    => $accQuery,
        ]);
    }
}
