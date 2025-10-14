<?php

namespace App\Http\Controllers;

use App\Http\Resources\DetailAccountingResource;
use App\Models\DetailAccounting;
use App\Http\Requests\StoreDetailAccountingRequest;
use App\Http\Requests\UpdateDetailAccountingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class DetailAccountingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDetailAccountingRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(DetailAccounting $detailAccounting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
  public function edit(\App\Models\DetailAccounting $detailAccounting)
{
    // Proviamo a ricavare le opzioni dello Stato dall'enum se esiste; altrimenti fallback sicuro
    $statusOptions = [];
    // 1) enum di progetto (se esiste)
    if (class_exists(\App\Enums\DetailAccountingStatus::class)) {
        $statusOptions = array_map(fn($c) => $c->value, \App\Enums\DetailAccountingStatus::cases());
    }
    // 2) fallback pulito (non rompe se non c'è l'enum)
    if (!$statusOptions) {
        $statusOptions = ['APERTA', 'PAGATA', 'SCADUTA']; // aggiorna qui se serve
    }

    return inertia('DetailAccounting/Edit', [
        'detailAccounting' => $detailAccounting,
        'statusOptions'    => $statusOptions,
        'success'          => session('success'),
    ]);
}

public function update(\App\Models\DetailAccounting $detailAccounting)
{
    // stesse options della edit per validare coerentemente
    $statusOptions = [];
    if (class_exists(\App\Enums\DetailAccountingStatus::class)) {
        $statusOptions = array_map(fn($c) => $c->value, \App\Enums\DetailAccountingStatus::cases());
    }
    if (!$statusOptions) {
        $statusOptions = ['APERTA', 'PAGATA', 'SCADUTA'];
    }

    $data = request()->validate([
        'Stato'             => ['nullable', 'in:'.implode(',', $statusOptions)],
        'ModalitaPagamento' => ['nullable', 'string', 'max:100'],
        'TipoPagamento'     => ['nullable', 'string', 'max:100'],
        'DataScadenza'      => ['nullable', 'date'],
        'Importo'           => ['nullable'], // aggiungi 'numeric' se il campo è DECIMAL
        'Note'              => ['nullable', 'string', 'max:255'],
    ]);

    $detailAccounting->update($data);

    return back()->with('success', 'Riga aggiornata correttamente');
}



    /**
     * Remove the specified resource from storage.
     */
      public function destroy(DetailAccounting $detailaccounting)
    {
        $deleted = $detailaccounting->delete();

        return back()->with(
            'success',
            $deleted ? 'Riga pagamento eliminata' : 'Nessuna riga eliminata'
        );
    }
}
