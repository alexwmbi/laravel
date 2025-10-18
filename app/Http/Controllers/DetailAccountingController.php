<?php

namespace App\Http\Controllers;

use App\Http\Resources\DetailAccountingResource;
use App\Models\DetailAccounting;
use App\Enums\PaymentType;
use Illuminate\Validation\Rules\Enum as EnumRule;

class DetailAccountingController extends Controller
{
    public function edit(DetailAccounting $detailAccounting)
    {
        // Opzioni STATO (come avevi già fatto)
        $statusOptions = [];
        if (class_exists(\App\Enums\DetailAccountingStatus::class)) {
            $statusOptions = array_map(fn($c) => $c->value, \App\Enums\DetailAccountingStatus::cases());
        }
        if (!$statusOptions) {
            $statusOptions = ['aperta', 'pagata', 'parziale']; // minuscolo per coerenza col resto dell’app
        }

        // Opzioni TIPO PAGAMENTO dall'enum
        $paymentTypeOptions = array_map(
            fn(PaymentType $c) => ['value' => $c->value, 'label' => $c->label()],
            PaymentType::cases()
        );

        // Se hai messo il cast enum, per la form vogliamo una stringa
        $payload = [
            'id'                    => $detailAccounting->id,
            'accountingId'          => $detailAccounting->accountingId,
            'stato'                 => $detailAccounting->stato,
            'modalitaPagamento'     => $detailAccounting->modalitaPagamento,
            'tipoPagamento'         => ($detailAccounting->tipoPagamento instanceof PaymentType)
                ? $detailAccounting->tipoPagamento->value
                : $detailAccounting->tipoPagamento,
            'dataScadenzaPagamento' => $detailAccounting->dataScadenzaPagamento,
            'importoPagamento'      => $detailAccounting->importoPagamento,
            'note'                  => $detailAccounting->note,
        ];

        return inertia('DetailAccounting/Edit', [
            'detailAccounting'   => $payload,
            'statusOptions'      => $statusOptions,
            'paymentTypeOptions' => $paymentTypeOptions,
            'success'            => session('success'),
            'backQuery' => request()->query() ?: null,
        ]);
    }

    public function update(DetailAccounting $detailAccounting)
    {
        // Stesse options della edit per coerenza validazione
        $statusOptions = [];
        if (class_exists(\App\Enums\DetailAccountingStatus::class)) {
            $statusOptions = array_map(fn($c) => $c->value, \App\Enums\DetailAccountingStatus::cases());
        }
        if (!$statusOptions) {
            $statusOptions = ['aperta', 'pagata', 'parziale'];
        }

        $data = request()->validate([
            'stato'                 => ['sometimes', 'required', 'in:' . implode(',', $statusOptions)],
            'modalitaPagamento'     => ['sometimes', 'nullable', 'string', 'max:100'],
            // ⬇️ Enum PaymentType qui
            'tipoPagamento'         => ['sometimes', 'nullable', new EnumRule(PaymentType::class)],
            'dataScadenzaPagamento' => ['sometimes', 'nullable', 'date'],
            'importoPagamento'      => ['sometimes', 'nullable', 'numeric'],
            'note'                  => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $detailAccounting->update($data);

        return back()->with('success', 'Riga pagamento aggiornata');
    }

    public function destroy(DetailAccounting $detailaccounting)
    {
        $deleted = $detailaccounting->delete();

        return back()->with(
            'success',
            $deleted ? 'Riga pagamento eliminata' : 'Nessuna riga eliminata'
        );
    }
}
