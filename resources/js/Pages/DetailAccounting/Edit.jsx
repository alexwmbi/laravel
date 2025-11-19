import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowUturnLeftIcon, PencilSquareIcon } from "@heroicons/react/16/solid";

const toDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v).slice(0, 10)
    : d.toISOString().slice(0, 10);
};

export default function Edit({
  auth,
  detailAccounting,
  statusOptions = [],      // non lo usiamo più, ma lo mantengo per compatibilità
  paymentTypeOptions = [], // { value, label }
  backQuery = {},          // arriva dal controller: request()->query()
  success,
}) {
  const d = detailAccounting?.data ?? detailAccounting ?? {};

  // solo due stati ammessi: aperta / pagata
  const allowedStatus = ["aperta", "pagata"];

  // fallback locale per i tipi pagamento nel caso non arrivino dal backend
  const paymentOpts = paymentTypeOptions?.length
    ? paymentTypeOptions
    : [
        { value: "bonifico", label: "Bonifico" },
        { value: "riba", label: "Ri.Ba." },
        { value: "contanti", label: "Contanti" },
        { value: "assegno", label: "Assegno" },
      ];

  const { data, setData, put, processing, errors } = useForm({
    stato: d.stato ?? "",
    modalitaPagamento: d.modalitaPagamento ?? "",
    tipoPagamento: d.tipoPagamento ?? "",
    dataScadenzaPagamento: toDateInput(d.dataScadenzaPagamento ?? ""),
    importoPagamento: d.importoPagamento ?? "",
    note: d.note ?? "",
  });

  const goBackToList = () =>
    router.get(route("accounting.index", backQuery || {}));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!d?.id) return;

    put(route("detailaccounting.update", d.id), {
      preserveScroll: true,
      onSuccess: goBackToList, // torna a /accounting con gli stessi query param (es. ?page=2)
    });
  };

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Modifica Riga #${d?.id ?? ""}`} />

      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifica riga{" "}
            {d?.id ? <span className="text-gray-400">#{d.id}</span> : null}
          </h1>

          <Link
            href={route("accounting.index", backQuery || {})}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Torna all’elenco
          </Link>
        </div>

        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            {success}
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* STATO */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stato
                </label>
                <SelectInput
                  value={data.stato}
                  onChange={(e) => setData("stato", e.target.value)}
                >
                  <option value="">— seleziona —</option>
                  {allowedStatus.map((v) => (
                    <option key={v} value={v}>
                      {v === "aperta" ? "aperta" : "pagata"}
                    </option>
                  ))}
                </SelectInput>
                {errors.stato && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stato}
                  </p>
                )}
              </div>

              {/* MODALITÀ PAGAMENTO (libera) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Modalità Pagamento
                </label>
                <TextInput
                  value={data.modalitaPagamento}
                  onChange={(e) =>
                    setData("modalitaPagamento", e.target.value)
                  }
                />
                {errors.modalitaPagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.modalitaPagamento}
                  </p>
                )}
              </div>

              {/* TIPO PAGAMENTO (enum) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo Pagamento
                </label>
                <SelectInput
                  value={data.tipoPagamento ?? ""}
                  onChange={(e) =>
                    setData("tipoPagamento", e.target.value || null)
                  }
                >
                  <option value="">— seleziona —</option>
                  {paymentOpts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </SelectInput>
                {errors.tipoPagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tipoPagamento}
                  </p>
                )}
              </div>

              {/* DATA SCADENZA */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  value={data.dataScadenzaPagamento}
                  onChange={(e) =>
                    setData("dataScadenzaPagamento", e.target.value)
                  }
                />
                {errors.dataScadenzaPagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dataScadenzaPagamento}
                  </p>
                )}
              </div>

              {/* IMPORTO */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Importo
                </label>
                <TextInput
                  type="number"
                  step="0.01"
                  value={data.importoPagamento}
                  onChange={(e) =>
                    setData("importoPagamento", e.target.value)
                  }
                />
                {errors.importoPagamento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.importoPagamento}
                  </p>
                )}
              </div>

              {/* NOTE */}
              <div>
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
                href={route("accounting.index", backQuery || {})}
                className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Annulla
              </Link>
              <button
                type="submit"
                disabled={processing || !d?.id}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Salva riga
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
