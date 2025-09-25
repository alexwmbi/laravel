import React, { useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ACCOUNTING_STATUS_CLASS_MAP, ACCOUNTING_STATUS_TEXT_MAP } from "@/constants.jsx";
import { ArrowUturnLeftIcon, PencilSquareIcon } from "@heroicons/react/16/solid";

export default function Edit({ auth, accounting, detailAccountings = [], success }) {
  const accountingData = useMemo(() => (accounting?.data ?? accounting ?? {}), [accounting]);

  if (!accountingData?.id) {
    return (
      <AuthenticatedLayout user={auth?.user}>
        <Head title="Modifica Fattura" />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
            Dati fattura non disponibili. Verifica il controller.
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const { data, setData, put, processing, errors } = useForm({
    id: accountingData.id,
    Progressivo: accountingData.Progressivo ?? "",
    ProgressivoInvio: accountingData.ProgressivoInvio ?? "",
    Nome: accountingData.Nome ?? "",
    Stato: accountingData.Stato ?? "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    put(route("accounting.update", accountingData.id), { preserveScroll: true });
  };

  const rows = Array.isArray(detailAccountings?.data)
    ? detailAccountings.data
    : Array.isArray(detailAccountings)
    ? detailAccountings
    : [];

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Modifica Fattura #${accountingData.id}`} />

      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifica Fattura <span className="text-gray-400">#{accountingData.id}</span>
          </h1>
          <Link
            href={route("accounting.index")}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Indietro
          </Link>
        </div>

        {success && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            {success}
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo</label>
                <TextInput
                  value={data.Progressivo}
                  onChange={(e) => setData("Progressivo", e.target.value)}
                />
                {errors.Progressivo && (
                  <p className="mt-1 text-sm text-red-600">{errors.Progressivo}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo Invio</label>
                <TextInput
                  value={data.ProgressivoInvio}
                  onChange={(e) => setData("ProgressivoInvio", e.target.value)}
                />
                {errors.ProgressivoInvio && (
                  <p className="mt-1 text-sm text-red-600">{errors.ProgressivoInvio}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
                <TextInput value={data.Nome} onChange={(e) => setData("Nome", e.target.value)} />
                {errors.Nome && <p className="mt-1 text-sm text-red-600">{errors.Nome}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stato</label>
                <SelectInput
                  value={data.Stato}
                  onChange={(e) => setData("Stato", e.target.value)}
                >
                  <option value="">— seleziona —</option>
                  {Object.keys(ACCOUNTING_STATUS_TEXT_MAP).map((key) => (
                    <option key={key} value={key}>
                      {ACCOUNTING_STATUS_TEXT_MAP[key]}
                    </option>
                  ))}
                </SelectInput>
                {errors.Stato && <p className="mt-1 text-sm text-red-600">{errors.Stato}</p>}
                {data.Stato && (
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${ACCOUNTING_STATUS_CLASS_MAP[data.Stato]}`}
                    >
                      {ACCOUNTING_STATUS_TEXT_MAP[data.Stato]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                href={route("accounting.index")}
                className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Salva modifiche
              </button>
            </div>
          </form>
        </div>

        {/* DETTAGLI TABLE CARD */}
        <div className="mt-8 bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold">Dettagli fattura</h2>
          </div>
          <div className="border-t">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Descrizione</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Quantità</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Prezzo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                        Nessun dettaglio disponibile.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-4 py-2">{row.id}</td>
                      <td className="px-4 py-2">{row.Descrizione ?? "-"}</td>
                      <td className="px-4 py-2">{row.Qta ?? "-"}</td>
                      <td className="px-4 py-2">{row.Prezzo ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
