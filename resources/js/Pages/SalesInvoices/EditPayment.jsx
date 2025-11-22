import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowUturnLeftIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import {
  ACCOUNTING_STATUS_CLASS_MAP,
  ACCOUNTING_STATUS_TEXT_MAP,
} from "@/constants.jsx";

const fmtDateToInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v).slice(0, 10)
    : d.toISOString().slice(0, 10);
};

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

export default function EditPayment({ auth, payment, invoice, backQuery = null, success }) {
  const p = payment ?? {};
  const inv = invoice ?? {};

  const { data, setData, put, processing, errors } = useForm({
    stato: p.stato ?? "aperta",
    modalita_pagamento: p.modalita_pagamento ?? "",
    tipo_pagamento: p.tipo_pagamento ?? "",
    data_scadenza_pagamento: p.data_scadenza_pagamento ?? "",
    importo_pagamento: p.importo_pagamento ?? "",
    note: p.note ?? "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!p?.id) return;

    const params = backQuery ? { payment: p.id, ...backQuery } : { payment: p.id };

    put(route("salesinvoice.payments.update", params), {
      preserveScroll: true,
    });
  };

  const backHref = route("salesinvoice.show", inv.id);

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Modifica rata pagamento #${p?.id ?? ""}`} />

      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Modifica rata pagamento
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Fattura {inv?.numero_completo} –{" "}
              {inv?.client?.name || "Cliente"}
            </p>
          </div>

          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Torna alla fattura
          </Link>
        </div>

        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            {success}
          </div>
        )}

        <div className="bg-white shadow-sm sm:rounded-lg">
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stato
                </label>
                <SelectInput
                  value={data.stato}
                  onChange={(e) => setData("stato", e.target.value)}
                >
                  <option value="aperta">Aperta</option>
                  <option value="pagata">Pagata</option>
                  <option value="parziale">Parziale</option>
                </SelectInput>
                {errors.stato && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stato}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Modalità pagamento
                </label>
                <TextInput
                  value={data.modalita_pagamento}
                  onChange={(e) =>
                    setData("modalita_pagamento", e.target.value)
                  }
                />
                {errors.modalita_pagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.modalita_pagamento}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo pagamento
                </label>
                <SelectInput
                  value={data.tipo_pagamento || ""}
                  onChange={(e) =>
                    setData("tipo_pagamento", e.target.value)
                  }
                >
                  <option value="">-</option>
                  <option value="bonifico">Bonifico</option>
                  <option value="riba">Ri.Ba</option>
                  <option value="contanti">Contanti</option>
                  <option value="assegno">Assegno</option>
                </SelectInput>
                {errors.tipo_pagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tipo_pagamento}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Data scadenza
                </label>
                <TextInput
                  type="date"
                  value={fmtDateToInput(
                    data.data_scadenza_pagamento
                  )}
                  onChange={(e) =>
                    setData("data_scadenza_pagamento", e.target.value)
                  }
                />
                {errors.data_scadenza_pagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.data_scadenza_pagamento}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Importo
                </label>
                <TextInput
                  type="number"
                  step="0.01"
                  value={data.importo_pagamento}
                  onChange={(e) =>
                    setData("importo_pagamento", e.target.value)
                  }
                />
                {errors.importo_pagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.importo_pagamento}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Anteprima:{" "}
                  <span className="font-medium">
                    {formatEUR(data.importo_pagamento || 0)}
                  </span>
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Note
                </label>
                <TextInput
                  value={data.note}
                  onChange={(e) => setData("note", e.target.value)}
                />
                {errors.note && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.note}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href={backHref}
                className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={processing || !p?.id}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Salva rata
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
