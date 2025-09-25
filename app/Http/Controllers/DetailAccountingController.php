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
    public function edit(DetailAccounting $detailAccounting)
    {
        // dd($detailAccounting);
        //dd(request()->route('detailaccounting'));

        $detailAccounting = DetailAccounting::where('id', request()->route('detailaccounting'))->first();
        //dd( $detailAccounting);
        return inertia("Accounting/Edit", ['detailaccounting' => new DetailAccountingResource($detailAccounting)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDetailAccountingRequest $request, DetailAccounting $detailAccounting)
    {
     // dd($request); 
       // $detailAccounting->update($request->validated());
       // return to_route('accounting.index')->with('success', 'Fattura modificata');
       try {
        // Estrai i dati validati
        $validated = $request->validated();

        // Prepara la query SQL di aggiornamento
        $query = "
            UPDATE detail_accountings
            SET
                stato = ?,
                modalitaPagamento = ?,
                dataScadenzaPagamento = ?,
                importoPagamento = ?,
                note = ?
            WHERE id = ?
        ";

        // Esegui la query con i dati validati
        DB::statement($query, [
            $validated['stato'],
            $validated['modalitaPagamento'],
            $validated['dataScadenzaPagamento'],
            $validated['importoPagamento'],
            $validated['note'],
            $request->id, // ID del record da aggiornare
        ]);

        // Successo
        return redirect()->route('accounting.index')->with('success', 'Fattura modificata');
    } catch (\Exception $e) {
        // Logga l'errore
        Log::error('Errore durante l\'aggiornamento:', ['error' => $e->getMessage()]);

        // Errore
        return redirect()->route('accounting.index')->with('error', 'Errore durante la modifica della fattura');
    }
   
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DetailAccounting $detailAccounting)
    {
        //
    }
}
