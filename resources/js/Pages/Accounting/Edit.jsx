import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowUturnLeftIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import { ACCOUNTING_STATUS_CLASS_MAP, ACCOUNTING_STATUS_TEXT_MAP } from "@/constants.jsx";

const toYmd = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v).slice(0, 10) : d.toISOString().slice(0, 10);
};

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

// "YYYY-MM-DD" (o ISO) -> "gg/mm/aaaa" per la resa in tabella
const fmtDateIT = (val) => {
  if (!val) return "";
  const s = String(val);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1) + "";
    const mm2 = mm.padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm2}/${yyyy}`;
  }
  return s;
};

// Etichetta stato per la TESTATA: "aperta" -> "Da saldare"
const accountingStatusLabel = (status) => {
  if (!status) return "";
  if (status === "aperta") return "Da saldare";
  return ACCOUNTING_STATUS_TEXT_MAP[status] || status;
};

export default function Edit({ auth, accounting, detailAccountings = [], success, backQuery = null }) {
  const a = accounting?.data ?? accounting ?? {};

  // campi allineati ai nomi backend
  const { data, setData, put, processing, errors } = useForm({
    Progressivo: a?.Progressivo ?? "",
    ProgressivoInvio: a?.ProgressivoInvio ?? "",
    FornitoreNome: a?.FornitoreNome ?? "",
    Numero: a?.Numero ?? "",
    Note: a?.Note ?? "", // nuovo campo in input singola riga
    Data: a?.Data ?? "",
    ImportoTotaleDocumento: a?.ImportoTotaleDocumento ?? "",
    Stato: a?.Stato ?? "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!a?.id) return;

    // Includo backQuery nella route update per mantenere page + filtri
    const params = backQuery ? { accounting: a.id, ...backQuery } : { accounting: a.id };

    // update "classico" (il segno viene gestito dal controller quando si cambia TipoDocumento via patchField)
    put(route("accounting.update", params), {
      preserveScroll: true,
    });
  };

  // dettagli
  const rows = Array.isArray(detailAccountings?.data)
    ? detailAccountings.data
    : Array.isArray(detailAccountings)
    ? detailAccountings
    : [];

  // helper per importi coerenti con tipo documento
  const signed = (tipo, v) => ((tipo === "TD04") ? -1 : 1) * Number(v ?? 0);

  // back URL con eventuali query di ritorno
  const backHref = backQuery ? route("accounting.index", backQuery) : route("accounting.index");

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Modifica Documento #${a?.id ?? ""}`} />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Modifica Documento {a?.id ? <span className="text-gray-400">#{a.id}</span> : null}
            </h1>

            {a?.TipoDocumento && (
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
                  (a.TipoDocumento === "TD04"
                    ? "bg-pink-50 text-pink-700 border-pink-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200")
                }
              >
                {a.TipoDocumento === "TD04" ? "Nota di credito (TD04)" : "Fattura (TD01)"}
              </span>
            )}
          </div>

          <Link
            href={backHref}
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
              {/* Tipo documento (patch immediato per riallineo segno) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo documento</label>
                <SelectInput
                  value={a?.TipoDocumento ?? "TD01"}
                  onChange={(e) => {
                    if (!a?.id) return;
                    const v = e.target.value;
                    router.patch(
                      route("accounting.patchField", a.id),
                      { TipoDocumento: v },
                      { preserveScroll: true, preserveState: true }
                    );
                  }}
                >
                  <option value="TD01">Fattura (TD01)</option>
                  <option value="TD04">Nota di credito (TD04)</option>
                </SelectInput>
                <p className="mt-1 text-xs text-gray-500">
                  Se imposti <strong>Nota di credito</strong>, il totale verrà salvato automaticamente con segno negativo.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo</label>
                <TextInput
                  value={data.Progressivo}
                  onChange={(e) => setData("Progressivo", e.target.value)}
                />
                {errors.Progressivo && <p className="mt-1 text-sm text-red-600">{errors.Progressivo}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Progressivo Invio</label>
                <TextInput
                  value={data.ProgressivoInvio}
                  onChange={(e) => setData("ProgressivoInvio", e.target.value)}
                />
                {errors.ProgressivoInvio && <p className="mt-1 text-sm text-red-600">{errors.ProgressivoInvio}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fornitore</label>
                <TextInput
                  value={data.FornitoreNome}
                  onChange={(e) => setData("FornitoreNome", e.target.value)}
                />
                {errors.FornitoreNome && <p className="mt-1 text-sm text-red-600">{errors.FornitoreNome}</p>}
              </div>

              {/* --- RIGA: Numero | Note --- */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Numero</label>
                <TextInput
                  value={data.Numero}
                  onChange={(e) => setData("Numero", e.target.value)}
                />
                {errors.Numero && <p className="mt-1 text-sm text-red-600">{errors.Numero}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
                <TextInput
                  value={data.Note}
                  onChange={(e) => setData("Note", e.target.value)}
                  placeholder="Annotazioni / Causale"
                />
                {errors.Note && <p className="mt-1 text-sm text-red-600">{errors.Note}</p>}
              </div>

              {/* --- RIGA: Data | Stato --- */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
                <TextInput
                  type="date"
                  value={toYmd(data.Data)}
                  onChange={(e) => setData("Data", e.target.value)}
                />
                {errors.Data && <p className="mt-1 text-sm text-red-600">{errors.Data}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stato</label>
                <SelectInput value={data.Stato} onChange={(e) => setData("Stato", e.target.value)}>
                  <option value="">— seleziona —</option>
                  {Object.keys(ACCOUNTING_STATUS_TEXT_MAP).map((key) => (
                    <option key={key} value={key}>
                      {accountingStatusLabel(key)}
                    </option>
                  ))}
                </SelectInput>
                {errors.Stato && <p className="mt-1 text-sm text-red-600">{errors.Stato}</p>}
                {data.Stato && (
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span
                      className={
                        `inline-block rounded px-2 py-0.5 text-xs ${ACCOUNTING_STATUS_CLASS_MAP[data.Stato]}`
                      }
                    >
                      {accountingStatusLabel(data.Stato)}
                    </span>
                  </div>
                )}
              </div>

              {/* --- NUOVA RIGA: Totale a tutta larghezza --- */}
              <div className="sm:col-span-2">
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
                <p className="mt-1 text-xs text-gray-500">
                  Anteprima:{" "}
                  <span className="font-medium">
                    {formatEUR(
                      Number((a?.TipoDocumento === "TD04" ? -1 : 1) * Number(data.ImportoTotaleDocumento || 0))
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                href={backHref}
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

        {/* RIGHE PAGAMENTO */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Righe pagamento</h2>
            {a?.TipoDocumento === "TD04" && (
              <span className="text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2 py-1 rounded">
                Nota di credito: importi mostrati in negativo
              </span>
            )}
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
                  {rows.length ? (
                    rows.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-4 py-2">
                          {row.stato ? (
                            <span
                              className={
                                "px-2 py-1 rounded text-white " + ACCOUNTING_STATUS_CLASS_MAP[row.stato]
                              }
                            >
                              {ACCOUNTING_STATUS_TEXT_MAP[row.stato]}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-2">{row.modalitaPagamento ?? "-"}</td>
                        <td className="px-4 py-2">{row.tipoPagamento ?? "-"}</td>
                        <td className="px-4 py-2">{fmtDateIT(row.dataScadenzaPagamento)}</td>
                        <td className="px-4 py-2">
                          {formatEUR(signed(a?.TipoDocumento, row.importoPagamento))}
                        </td>
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
