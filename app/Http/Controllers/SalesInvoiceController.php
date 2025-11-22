<?php

namespace App\Http\Controllers;

use App\Models\SalesInvoice;
use App\Models\SalesInvoicePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SalesInvoiceController extends Controller
{
    /** Tipi SdI che rappresentano note di credito */
    private const CREDIT_NOTE_TYPES = ['TD04'];

    /**
     * Converte eventuali enum/valori complessi in stringa (stile AccountingController).
     */
    private function enumToString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value) || is_numeric($value)) {
            return (string) $value;
        }

        if ($value instanceof \BackedEnum) {
            return (string) $value->value;
        }

        if ($value instanceof \UnitEnum) {
            return (string) $value->name;
        }

        if (method_exists($value, '__toString')) {
            return (string) $value;
        }

        return json_encode($value);
    }

    /**
     * Calcola stato header (aperta/pagata/parziale) a partire da totale/pagato.
     */
    private function computeHeaderStatus(float $total, float $paid): string
    {
        $due = $total - $paid;
        $eps = 0.005;

        if (abs($paid) < $eps) {
            return 'aperta';
        }

        if (abs($due) < $eps) {
            return 'pagata';
        }

        return 'parziale';
    }

    public function index(Request $request)
    {
        $base = SalesInvoice::query();

        // === FILTRI ===

        // Cliente
        if ($request->filled('cliente')) {
            $term = $request->string('cliente');
            $base->whereHas('client', function ($q) use ($term) {
                $q->where('name', 'like', '%' . $term . '%');
            });
        }

        // Numero
        if ($request->filled('numero')) {
            $base->where('numero', 'like', '%' . $request->string('numero') . '%');
        }

        // Anno
        if ($request->filled('anno')) {
            $base->where('anno', $request->integer('anno'));
        }

        // Tipo documento
        if ($request->filled('tipo_documento')) {
            $base->where('tipo_documento', $request->string('tipo_documento'));
        }

        // Tipo vendita (se lo userai)
        if ($request->filled('tipo_vendita')) {
            $base->where('tipo_vendita', $request->string('tipo_vendita'));
        }

        // Stato SDI (testuale, filtro LIKE semplice)
        if ($request->filled('sdi_status')) {
            $base->where('sdi_status', 'like', '%' . $request->string('sdi_status') . '%');
        }

        // Lavoro
        if ($request->filled('work_id')) {
            $base->where('work_id', $request->integer('work_id'));
        }

        // Data documento (da / a)
        if ($request->filled('date_from')) {
            $base->whereDate('data_documento', '>=', $request->date('date_from')->format('Y-m-d'));
        }
        if ($request->filled('date_to')) {
            $base->whereDate('data_documento', '<=', $request->date('date_to')->format('Y-m-d'));
        }

        // Scadenza pagamento (da / a) sulle rate
        if ($request->filled('due_from')) {
            $base->whereHas('payments', function ($q) use ($request) {
                $q->whereDate(
                    'data_scadenza_pagamento',
                    '>=',
                    $request->date('due_from')->format('Y-m-d')
                );
            });
        }
        if ($request->filled('due_to')) {
            $base->whereHas('payments', function ($q) use ($request) {
                $q->whereDate(
                    'data_scadenza_pagamento',
                    '<=',
                    $request->date('due_to')->format('Y-m-d')
                );
            });
        }

        // Stato header (aperta/pagata/parziale) calcolato come Accounting
        if ($request->filled('stato')) {
            $stato = strtolower($request->string('stato'));

            $base->where(function ($q) use ($stato) {
                $sumPaidExpr = "COALESCE((
                    SELECT SUM(
                        CASE
                            WHEN p.stato = 'pagata' THEN
                                CASE
                                    WHEN sales_invoices.tipo_documento IN ('TD04')
                                        THEN -ABS(p.importo_pagamento)
                                    ELSE ABS(p.importo_pagamento)
                                END
                            ELSE 0
                        END
                    )
                    FROM sales_invoice_payments p
                    WHERE p.sales_invoice_id = sales_invoices.id
                ), 0)";

                $totalExpr = "CASE
                    WHEN sales_invoices.tipo_documento IN ('TD04')
                        THEN -ABS(sales_invoices.totale_documento)
                    ELSE ABS(sales_invoices.totale_documento)
                END";

                $eps = 0.005;

                if ($stato === 'aperta') {
                    $q->whereRaw("ABS($sumPaidExpr) < ?", [$eps]);
                } elseif ($stato === 'pagata') {
                    $q->whereRaw("ABS($totalExpr - $sumPaidExpr) < ?", [$eps]);
                } elseif ($stato === 'parziale') {
                    $q->whereRaw("
                        ABS($sumPaidExpr) >= ?
                        AND ABS($totalExpr - $sumPaidExpr) >= ?
                    ", [$eps, $eps]);
                }
            });
        }

        // === TOTALI (stessi filtri) ===
        $count = (clone $base)->count();

        $sumDocs = (clone $base)->selectRaw("
            COALESCE(SUM(
                CASE
                    WHEN tipo_documento IN ('TD04')
                        THEN -ABS(totale_documento)
                    ELSE ABS(totale_documento)
                END
            ), 0) as s
        ")->value('s');

        // Pagato filtrato
        $filteredIdsSub = (clone $base)->select('id');

        $sumPaid = DB::table('sales_invoice_payments as p')
            ->joinSub($filteredIdsSub, 'si', 'p.sales_invoice_id', '=', 'si.id')
            ->join('sales_invoices as h', 'h.id', '=', 'p.sales_invoice_id')
            ->where('p.stato', '=', 'pagata')
            ->selectRaw("
                COALESCE(SUM(
                    CASE
                        WHEN h.tipo_documento IN ('TD04')
                            THEN -ABS(p.importo_pagamento)
                        ELSE ABS(p.importo_pagamento)
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

        // === ORDINAMENTO + PAGINAZIONE ===
        $tableQuery = (clone $base)
            ->with([
                'client',
                'work',
                'payments' => fn($q) => $q->orderBy('data_scadenza_pagamento'),
            ]);

        $allowedSort = [
            'data_documento',
            'numero',
            'anno',
            'totale_documento',
            'tipo_documento',
            'sdi_status',
            'created_at',
        ];

        $sortField = $request->input('sort_field', 'data_documento');
        if (!in_array($sortField, $allowedSort, true)) {
            $sortField = 'data_documento';
        }

        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $tableQuery->orderBy($sortField, $sortDirection);

        $invoices = $tableQuery
            ->paginate(10)
            ->appends($request->query());

        return Inertia::render('SalesInvoices/Index', [
            'invoices'    => $invoices,
            'queryParams' => $request->query() ?: null,
            'success'     => session('success'),
            'totals'      => $totals,
        ]);
    }

    public function show(Request $request, SalesInvoice $salesinvoice)
    {
        // Carica le relazioni necessarie per la Show
        $invoice = $salesinvoice->load([
            'client',
            'work',
            'payments' => function ($q) {
                $q->orderBy('data_scadenza_pagamento');
            },
        ]);

        // Se usi accessors tipo getNumeroCompletoAttribute,
        // qui saranno già disponibili come $invoice->numero_completo

        return Inertia::render('SalesInvoices/Show', [
            'invoice'   => $invoice,
            // così quando torni indietro mantieni eventuali filtri della lista
            'backQuery' => $request->query() ?: null,
        ]);
    }


public function edit(Request $request, SalesInvoice $salesinvoice)
{
    $backQuery = $request->query() ?: null;

    $salesinvoice->load([
        'client',
        'work',
        'payments' => fn ($q) => $q->orderBy('data_scadenza_pagamento'),
    ]);

    return Inertia::render('SalesInvoices/Edit', [
        'invoice'   => $salesinvoice,   // <─ NOME PROP ALLINEATO
        'backQuery' => $backQuery,
    ]);
}

    public function update(Request $request, SalesInvoice $salesInvoice)
    {
        $data = $request->validate([
            'tipo_documento'          => ['required', 'in:TD01,TD02,TD04'],
            'tipo_vendita'           => ['nullable', 'string', 'max:50'],
            'serie'                  => ['nullable', 'string', 'max:10'],
            'numero'                 => ['required', 'string', 'max:20'],
            'anno'                   => ['required', 'integer', 'min:2000', 'max:2100'],
            'data_documento'         => ['required', 'date'],
            'valuta'                 => ['nullable', 'string', 'max:3'],
            'cambio'                 => ['nullable', 'numeric'],

            'imponibile_totale'      => ['nullable', 'numeric'],
            'imposta_totale'         => ['nullable', 'numeric'],
            'totale_documento'       => ['required', 'numeric'],

            'bollo_applicato'        => ['sometimes', 'boolean'],
            'bollo_importo'          => ['nullable', 'numeric'],

            'has_withholding_tax'    => ['sometimes', 'boolean'],
            'withholding_type'       => ['nullable', 'string', 'max:50'],
            'withholding_rate'       => ['nullable', 'numeric'],
            'withholding_amount'     => ['nullable', 'numeric'],

            'spese_accessorie'       => ['nullable', 'numeric'],
            'arrotondamento'         => ['nullable', 'numeric'],
            'totale_da_pagare'       => ['nullable', 'numeric'],

            'condizioni_pagamento'   => ['nullable', 'string', 'max:255'],
            'modalita_pagamento'     => ['nullable', 'string', 'max:100'],
            'data_scadenza_pagamento'=> ['nullable', 'date'],
            'iban'                   => ['nullable', 'string', 'max:50'],
            'istituto_bancario'      => ['nullable', 'string', 'max:255'],
            'intestatario_conto'     => ['nullable', 'string', 'max:255'],

            'note_interne'           => ['nullable', 'string'],
            'note_esterne'           => ['nullable', 'string'],
        ]);

        $tipo = $data['tipo_documento'] ?? $salesInvoice->tipo_documento;

        if (array_key_exists('totale_documento', $data)) {
            $amount = abs((float) $data['totale_documento']);
            $data['totale_documento'] = in_array($tipo, self::CREDIT_NOTE_TYPES, true)
                ? -$amount
                : $amount;
        }

        if (array_key_exists('bollo_applicato', $data)) {
            $data['bollo_applicato'] = (bool) $data['bollo_applicato'];
        }
        if (array_key_exists('has_withholding_tax', $data)) {
            $data['has_withholding_tax'] = (bool) $data['has_withholding_tax'];
        }

        $salesInvoice->update($data);

        $query = $request->query();

        return redirect()
            ->route('salesinvoice.index', $query ?: null)
            ->with('success', 'Fattura di vendita aggiornata');
    }

    public function destroy(SalesInvoice $salesInvoice)
    {
        if ($salesInvoice->isLocked()) {
            return back()->with('error', 'Impossibile eliminare: fattura bloccata.');
        }

        $salesInvoice->delete();

        return redirect()
            ->route('salesinvoice.index')
            ->with('success', 'Fattura di vendita eliminata');
    }

    // ===== CRUD RATE DI PAGAMENTO =====

    public function storePayment(Request $request, SalesInvoice $salesInvoice)
    {
        $data = $request->validate([
            'stato'                 => ['required', 'in:aperta,pagata,parziale'],
            'modalita_pagamento'    => ['nullable', 'string', 'max:100'],
            'tipo_pagamento'        => ['nullable', 'in:bonifico,riba,contanti,assegno'],
            'data_scadenza_pagamento'=> ['nullable', 'date'],
            'importo_pagamento'     => ['nullable', 'numeric'],
            'note'                  => ['nullable', 'string', 'max:500'],
        ]);

        $data['sales_invoice_id'] = $salesInvoice->id;

        SalesInvoicePayment::create($data);

        return back()->with('success', 'Rata di pagamento aggiunta');
    }

    public function editPayment(SalesInvoicePayment $payment)
    {
        $payment->load('invoice.client');

        return Inertia::render('SalesInvoices/EditPayment', [
            'payment' => [
                'id'                     => $payment->id,
                'sales_invoice_id'       => $payment->sales_invoice_id,
                'stato'                  => $payment->stato,
                'modalita_pagamento'     => $payment->modalita_pagamento,
                'tipo_pagamento'         => $payment->tipo_pagamento,
                'data_scadenza_pagamento'=> $payment->data_scadenza_pagamento,
                'importo_pagamento'      => $payment->importo_pagamento,
                'note'                   => $payment->note,
            ],
            'invoice' => [
                'id'              => $payment->invoice->id,
                'numero_completo' => $payment->invoice->numero_completo,
                'client'          => $payment->invoice->client
                    ? [
                        'id'   => $payment->invoice->client->id,
                        'name' => $payment->invoice->client->name,
                    ]
                    : null,
            ],
            'backQuery' => request()->query() ?: null,
            'success'   => session('success'),
        ]);
    }

    public function updatePayment(Request $request, SalesInvoicePayment $payment)
    {
        $data = $request->validate([
            'stato'                 => ['sometimes', 'required', 'in:aperta,pagata,parziale'],
            'modalita_pagamento'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'tipo_pagamento'        => ['sometimes', 'nullable', 'in:bonifico,riba,contanti,assegno'],
            'data_scadenza_pagamento'=> ['sometimes', 'nullable', 'date'],
            'importo_pagamento'     => ['sometimes', 'nullable', 'numeric'],
            'note'                  => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $payment->update($data);

        return redirect()
            ->route('salesinvoice.show', $payment->sales_invoice_id)
            ->with('success', 'Rata di pagamento aggiornata');
    }

    public function destroyPayment(SalesInvoicePayment $payment)
    {
        $invoiceId = $payment->sales_invoice_id;
        $payment->delete();

        return redirect()
            ->route('salesinvoice.show', $invoiceId)
            ->with('success', 'Rata di pagamento eliminata');
    }

    // ===== EXPORT CSV (stile Accounting) =====

    public function export(Request $request)
    {
        $base = SalesInvoice::query();

        // Stessi filtri della index()
        if ($request->filled('cliente')) {
            $term = $request->string('cliente');
            $base->whereHas('client', function ($q) use ($term) {
                $q->where('name', 'like', '%' . $term . '%');
            });
        }

        if ($request->filled('numero')) {
            $base->where('numero', 'like', '%' . $request->string('numero') . '%');
        }

        if ($request->filled('anno')) {
            $base->where('anno', $request->integer('anno'));
        }

        if ($request->filled('tipo_documento')) {
            $base->where('tipo_documento', $request->string('tipo_documento'));
        }

        if ($request->filled('tipo_vendita')) {
            $base->where('tipo_vendita', $request->string('tipo_vendita'));
        }

        if ($request->filled('sdi_status')) {
            $base->where('sdi_status', 'like', '%' . $request->string('sdi_status') . '%');
        }

        if ($request->filled('work_id')) {
            $base->where('work_id', $request->integer('work_id'));
        }

        if ($request->filled('date_from')) {
            $base->whereDate('data_documento', '>=', $request->date('date_from')->format('Y-m-d'));
        }
        if ($request->filled('date_to')) {
            $base->whereDate('data_documento', '<=', $request->date('date_to')->format('Y-m-d'));
        }

        if ($request->filled('due_from')) {
            $base->whereHas('payments', function ($q) use ($request) {
                $q->whereDate(
                    'data_scadenza_pagamento',
                    '>=',
                    $request->date('due_from')->format('Y-m-d')
                );
            });
        }
        if ($request->filled('due_to')) {
            $base->whereHas('payments', function ($q) use ($request) {
                $q->whereDate(
                    'data_scadenza_pagamento',
                    '<=',
                    $request->date('due_to')->format('Y-m-d')
                );
            });
        }

        if ($request->filled('stato')) {
            $stato = strtolower($request->string('stato'));

            $base->where(function ($q) use ($stato) {
                $sumPaidExpr = "COALESCE((
                    SELECT SUM(
                        CASE
                            WHEN p.stato = 'pagata' THEN
                                CASE
                                    WHEN sales_invoices.tipo_documento IN ('TD04')
                                        THEN -ABS(p.importo_pagamento)
                                    ELSE ABS(p.importo_pagamento)
                                END
                            ELSE 0
                        END
                    )
                    FROM sales_invoice_payments p
                    WHERE p.sales_invoice_id = sales_invoices.id
                ), 0)";

                $totalExpr = "CASE
                    WHEN sales_invoices.tipo_documento IN ('TD04')
                        THEN -ABS(sales_invoices.totale_documento)
                    ELSE ABS(sales_invoices.totale_documento)
                END";

                $eps = 0.005;

                if ($stato === 'aperta') {
                    $q->whereRaw("ABS($sumPaidExpr) < ?", [$eps]);
                } elseif ($stato === 'pagata') {
                    $q->whereRaw("ABS($totalExpr - $sumPaidExpr) < ?", [$eps]);
                } elseif ($stato === 'parziale') {
                    $q->whereRaw("
                        ABS($sumPaidExpr) >= ?
                        AND ABS($totalExpr - $sumPaidExpr) >= ?
                    ", [$eps, $eps]);
                }
            });
        }

        $tableQuery = (clone $base)->with(['client', 'payments']);

        $allowedSort = [
            'data_documento',
            'numero',
            'anno',
            'totale_documento',
            'tipo_documento',
            'sdi_status',
            'created_at',
        ];

        $sortField = $request->input('sort_field', 'data_documento');
        if (!in_array($sortField, $allowedSort, true)) {
            $sortField = 'data_documento';
        }
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $tableQuery->orderBy($sortField, $sortDirection);

        $invoices = $tableQuery->get();

        $hideDetails = filter_var($request->query('hideDetails'), FILTER_VALIDATE_BOOLEAN);

        $handle = fopen('php://temp', 'r+');

        // Header documento
        fputcsv($handle, [
            'NUMERO COMPLETO',
            'CLIENTE',
            'DATA',
            'TIPO DOCUMENTO',
            'TOTALE DOCUMENTO',
            'PAGATO',
            'DA PAGARE',
            'STATO',
            'SDI STATUS',
        ], ';');

        foreach ($invoices as $inv) {
            $total = (float) $inv->totale_documento;
            $isCredit = in_array($inv->tipo_documento, self::CREDIT_NOTE_TYPES, true);
            $total = $isCredit ? -abs($total) : abs($total);

            $paid = 0.0;
            foreach ($inv->payments as $p) {
                if ($this->enumToString($p->stato) === 'pagata') {
                    $val = (float) $p->importo_pagamento;
                    $val = abs($val);
                    if ($isCredit) {
                        $val = -$val;
                    }
                    $paid += $val;
                }
            }

            $due   = $total - $paid;
            $stato = $this->computeHeaderStatus($total, $paid);

            fputcsv($handle, [
                $inv->numero_completo,
                optional($inv->client)->name,
                optional($inv->data_documento)->format('Y-m-d'),
                $inv->tipo_documento,
                $total,
                $paid,
                $due,
                $stato,
                $inv->sdi_status,
            ], ';');
        }

        if (!$hideDetails) {
            fputcsv($handle, [], ';');

            fputcsv($handle, [
                'NUMERO COMPLETO',
                'STATO RIGA',
                'DATA SCADENZA',
                'IMPORTO',
                'NOTE',
            ], ';');

            foreach ($invoices as $inv) {
                $isCredit = in_array($inv->tipo_documento, self::CREDIT_NOTE_TYPES, true);

                foreach ($inv->payments as $p) {
                    $val = (float) $p->importo_pagamento;
                    $val = abs($val);
                    if ($isCredit) {
                        $val = -$val;
                    }

                    fputcsv($handle, [
                        $inv->numero_completo,
                        $this->enumToString($p->stato),
                        optional($p->data_scadenza_pagamento)->format('Y-m-d'),
                        $val,
                        $p->note ?? '',
                    ], ';');
                }
            }
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        $filename = 'fatture_vendita_' . now('Europe/Rome')->format('Ymd_His') . '.csv';

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma'              => 'no-cache',
            'Expires'             => '0',
        ]);
    }

    // ===== DOWNLOAD XML / PDF =====

    public function downloadXml(SalesInvoice $salesInvoice)
    {
        if (!$salesInvoice->xml_path) {
            abort(404, 'XML non disponibile');
        }

        $disk = Storage::disk(config('filesystems.default'));

        if (!$disk->exists($salesInvoice->xml_path)) {
            abort(404, 'File XML non trovato');
        }

        $filename = $salesInvoice->xml_filename
            ?: ('fattura_vendita_' . $salesInvoice->id . '.xml');

        return response()->streamDownload(
            function () use ($disk, $salesInvoice) {
                echo $disk->get($salesInvoice->xml_path);
            },
            $filename,
            [
                'Content-Type'           => 'application/xml; charset=UTF-8',
                'Content-Disposition'    => 'attachment; filename="' . $filename . '"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control'          => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma'                 => 'no-cache',
                'Expires'                => '0',
            ]
        );
    }

    public function downloadPdf(SalesInvoice $salesInvoice)
    {
        if (!$salesInvoice->pdf_path) {
            abort(404, 'PDF non disponibile');
        }

        $disk = Storage::disk(config('filesystems.default'));

        if (!$disk->exists($salesInvoice->pdf_path)) {
            abort(404, 'File PDF non trovato');
        }

        $filename = $salesInvoice->pdf_filename
            ?: ('fattura_vendita_' . $salesInvoice->id . '.pdf');

        return response()->streamDownload(
            function () use ($disk, $salesInvoice) {
                echo $disk->get($salesInvoice->pdf_path);
            },
            $filename,
            [
                'Content-Type'           => 'application/pdf',
                'Content-Disposition'    => 'attachment; filename="' . $filename . '"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control'          => 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma'                 => 'no-cache',
                'Expires'                => '0',
            ]
        );
    }
}
