import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowUturnLeftIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import { ACCOUNTING_STATUS_CLASS_MAP, ACCOUNTING_STATUS_TEXT_MAP } from "@/constants.jsx";

const toYmd = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 10) : d.toISOString().slice(0, 10);
};

export default function Edit({
  auth,
  accounting,
  detailAccountings = [],
  backQuery = {},          // ⬅️ nuovo: query della lista (es. { page: 2, ... })
  success,
}) {
  const a = accounting?.data ?? accounting ?? {};

  // campi allineati ai nomi backend
  const { data, setData, put, processing, errors } = useForm({
    Progressivo: a?.Progressivo ?? "",
    ProgressivoInvio: a?.ProgressivoInvio ?? "",
    FornitoreNome: a?.FornitoreNome ?? "",
    Numero: a?.Numero ?? "",
    Data: a?.Data ?? "",
    ImportoTotaleDocumento: a?.ImportoTotaleDocumento ?? "",
    Stato: a?.Stato ?? "",
  });

  const goBackToList = () => router.get(route("accounting.index", backQuery || {}));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!a?.id) return;
    put(route("accounting.update", a.id), {
      onSuccess: goBackToList,   // ⬅️ torna alla stessa pagina (es. ?page=2)
      preserveScroll: true,
    });
  };

  // righe dettagli
  const rows = Array.isArray(detailAccountings?.data)
    ? detailAccountings.data
    : Array.isArray(detailAccountings)
    ? detailAccountings
    : [];

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Modifica Fattura #${a?.id ?? ""}`} />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifica Fattura {a?.id ? <span className="text-gray-400">#{a.id}</span> : null}
          </h1>
          <Link
            href={route("accounting.index", backQuery || {})}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Indietro
          </Link>
        </div>

        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            {success}
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo</label>
                <TextInput value={data.Progressivo} onChange={(e) => setData("Progressivo", e.target.value)} />
                {errors.Progressivo && <p className="mt-1 text-sm text-red-600">{errors.Progressivo}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo Invio</label>
                <TextInput value={data.ProgressivoInvio} onChange={(e) => setData("ProgressivoInvio", e.target.value)} />
                {errors.ProgressivoInvio && <p className="mt-1 text-sm text-red-600">{errors.ProgressivoInvio}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fornitore</label>
                <TextInput value={data.FornitoreNome} onChange={(e) => setData("FornitoreNome", e.target.value)} />
                {errors.FornitoreNome && <p className="mt-1 text-sm text-red-600">{errors.FornitoreNome}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Numero</label>
                <TextInput value={data.Numero} onChange={(e) => setData("Numero", e.target.value)} />
                {errors.Numero && <p className="mt-1 text-sm text-red-600">{errors.Numero}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
                <TextInput
                  type="date"
                  value={data.Data ? data.Data.slice(0, 10) : ""}
                  onChange={(e) => setData("Data", e.target.value)}
                />
                {errors.Data && <p className="mt-1 text-sm text-red-600">{errors.Data}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Totale</label>
                <TextInput
                  type="number"
                  step="0.01"
                  value={data.ImportoTotaleDocumento}
                  onChange={(e) => setData("ImportoTotaleDocumento", e.target.value)}
                />
                {errors.ImportoTotaleDocumento && (
                  <p className="mt-1 text-sm text-red-600">{errors.ImportoTotaleDocumento}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stato</label>
                <SelectInput value={data.Stato} onChange={(e) => setData("Stato", e.target.value)}>
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
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${ACCOUNTING_STATUS_CLASS_MAP[data.Stato]}`}>
                      {ACCOUNTING_STATUS_TEXT_MAP[data.Stato]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                href={route("accounting.index", backQuery || {})}
                className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={processing || !a?.id}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Salva modifiche
              </button>
            </div>
          </form>
        </div>

        {/* DETTAGLI */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold">Dettagli fattura</h2>
          </div>
          <div className="border-t">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Stato</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Modalità Pagamento</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo Pagamento</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Data Scadenza</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Importo</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(rows) && rows.length) ? (
                    rows.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-4 py-2">
                          {row.stato ? (
                            <span className={"px-2 py-1 rounded text-white " + ACCOUNTING_STATUS_CLASS_MAP[row.stato]}>
                              {ACCOUNTING_STATUS_TEXT_MAP[row.stato]}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-2">{row.modalitaPagamento ?? "-"}</td>
                        <td className="px-4 py-2">{row.tipoPagamento ?? "-"}</td>
                        <td className="px-4 py-2">{toYmd(row.dataScadenzaPagamento)}</td>
                        <td className="px-4 py-2">{row.importoPagamento ?? "-"}</td>
                        <td className="px-4 py-2">{row.note ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                        Nessun dettaglio disponibile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
