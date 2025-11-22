import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  ArrowUturnLeftIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/16/solid";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

const fmtDateIT = (val) => {
  if (!val) return "";
  const s = String(val);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return s;
};

// anteprima totale con il segno corretto
const signedPreview = (tipoDocumento, totale) => {
  const raw = Number(totale ?? 0);
  if (Number.isNaN(raw)) return 0;
  return tipoDocumento === "TD04" ? -Math.abs(raw) : Math.abs(raw);
};

const Field = ({ label, error, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
    )}
  </div>
);

export default function Edit({ auth, invoice, backQuery = null }) {
  const inv = invoice ?? {};

  const backHref = backQuery
    ? route("salesinvoice.index", backQuery)
    : route("salesinvoice.index");

  const { data, setData, put, processing, errors } = useForm({
    // Documento
    tipo_documento: inv.tipo_documento ?? "TD01",
    tipo_vendita: inv.tipo_vendita ?? "",
    serie: inv.serie ?? "",
    numero: inv.numero ?? "",
    anno: inv.anno ?? "",
    data_documento: inv.data_documento ?? "",
    valuta: inv.valuta ?? "EUR",
    cambio: inv.cambio ?? "",

    imponibile_totale: inv.imponibile_totale ?? "",
    imposta_totale: inv.imposta_totale ?? "",
    totale_documento: inv.totale_documento ?? "",

    bollo_applicato: !!inv.bollo_applicato,
    bollo_importo: inv.bollo_importo ?? "",

    has_withholding_tax: !!inv.has_withholding_tax,
    withholding_type: inv.withholding_type ?? "",
    withholding_rate: inv.withholding_rate ?? "",
    withholding_amount: inv.withholding_amount ?? "",

    condizioni_pagamento: inv.condizioni_pagamento ?? "",
    modalita_pagamento: inv.modalita_pagamento ?? "",
    data_scadenza_pagamento: inv.data_scadenza_pagamento ?? "",

    iban: inv.iban ?? "",
    istituto_bancario: inv.istituto_bancario ?? "",
    intestatario_conto: inv.intestatario_conto ?? "",

    note_interne: inv.note_interne ?? "",
    note_esterne: inv.note_esterne ?? "",
  });

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setData(field, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("salesinvoice.update", { salesinvoice: inv.id }), {
      preserveScroll: true,
    });
  };

  const previewTotal = signedPreview(
    data.tipo_documento,
    data.totale_documento
  );

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Fattura di vendita
          </h2>

          <div className="flex gap-2">
            {inv.xml_path && (
              <a
                href={route("salesinvoice.xml", inv.id)}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                XML
              </a>
            )}
            {inv.pdf_path && (
              <a
                href={route("salesinvoice.pdf", inv.id)}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                PDF
              </a>
            )}
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Indietro
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Modifica fattura di vendita" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white shadow-sm sm:rounded-lg p-6"
          >
            {/* DOCUMENTO */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Documento</h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Colonna sinistra */}
                <div>
                  <Field label="Tipo documento" error={errors.tipo_documento}>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.tipo_documento}
                      onChange={handleChange("tipo_documento")}
                    >
                      <option value="TD01">Fattura (TD01)</option>
                      <option value="TD02">
                        Acconto / Anticipo su fattura (TD02)
                      </option>
                      <option value="TD04">Nota di credito (TD04)</option>
                    </select>
                  </Field>

                  <Field label="Serie" error={errors.serie}>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.serie}
                      onChange={handleChange("serie")}
                    />
                  </Field>

                  <Field label="Anno" error={errors.anno}>
                    <input
                      type="number"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.anno}
                      onChange={handleChange("anno")}
                    />
                  </Field>

                  <Field label="Valuta" error={errors.valuta}>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.valuta}
                      onChange={handleChange("valuta")}
                    />
                  </Field>

                  <Field
                    label="Imponibile totale"
                    error={errors.imponibile_totale}
                  >
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.imponibile_totale}
                      onChange={handleChange("imponibile_totale")}
                    />
                  </Field>

                  <Field
                    label={
                      <>
                        Totale documento{" "}
                        <span className="text-xs text-gray-500 ml-1">
                          (anteprima con segno:{" "}
                          <span className="font-semibold">
                            {formatEUR(previewTotal)}
                          </span>
                          )
                        </span>
                      </>
                    }
                    error={errors.totale_documento}
                  >
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.totale_documento}
                      onChange={handleChange("totale_documento")}
                    />
                  </Field>

                  <div className="mt-4 flex items-center gap-2">
                    <input
                      id="bollo_applicato"
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={data.bollo_applicato}
                      onChange={handleChange("bollo_applicato")}
                    />
                    <label
                      htmlFor="bollo_applicato"
                      className="text-sm text-gray-700"
                    >
                      Sì, applica bollo
                    </label>
                  </div>
                </div>

                {/* Colonna destra */}
                <div>
                  <Field label="Tipo vendita" error={errors.tipo_vendita}>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.tipo_vendita}
                      onChange={handleChange("tipo_vendita")}
                      placeholder="Es. immediata, differita…"
                    />
                  </Field>

                  <Field label="Numero" error={errors.numero}>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.numero}
                      onChange={handleChange("numero")}
                    />
                  </Field>

                  <Field
                    label="Data documento"
                    error={errors.data_documento}
                  >
                    <input
                      type="date"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.data_documento ?? ""}
                      onChange={handleChange("data_documento")}
                    />
                  </Field>

                  <Field label="Cambio" error={errors.cambio}>
                    <input
                      type="number"
                      step="0.000001"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.cambio}
                      onChange={handleChange("cambio")}
                    />
                  </Field>

                  <Field
                    label="Imposta totale"
                    error={errors.imposta_totale}
                  >
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.imposta_totale}
                      onChange={handleChange("imposta_totale")}
                    />
                  </Field>

                  <Field label="Importo bollo" error={errors.bollo_importo}>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.bollo_importo}
                      onChange={handleChange("bollo_importo")}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* RITENUTA / PAGAMENTO */}
            <section>
              <h3 className="text-lg font-semibold mb-4">
                Pagamento e ritenute
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      id="has_withholding_tax"
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={data.has_withholding_tax}
                      onChange={handleChange("has_withholding_tax")}
                    />
                    <label
                      htmlFor="has_withholding_tax"
                      className="text-sm text-gray-700"
                    >
                      Applica ritenuta d&apos;acconto
                    </label>
                  </div>

                  <Field
                    label="Tipo ritenuta"
                    error={errors.withholding_type}
                  >
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.withholding_type}
                      onChange={handleChange("withholding_type")}
                    />
                  </Field>

                  <Field
                    label="Aliquota ritenuta (%)"
                    error={errors.withholding_rate}
                  >
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.withholding_rate}
                      onChange={handleChange("withholding_rate")}
                    />
                  </Field>

                  <Field
                    label="Importo ritenuta"
                    error={errors.withholding_amount}
                  >
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.withholding_amount}
                      onChange={handleChange("withholding_amount")}
                    />
                  </Field>
                </div>

                <div>
                  <Field
                    label="Condizioni pagamento"
                    error={errors.condizioni_pagamento}
                  >
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.condizioni_pagamento}
                      onChange={handleChange("condizioni_pagamento")}
                    />
                  </Field>

                  <Field
                    label="Modalità pagamento"
                    error={errors.modalita_pagamento}
                  >
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.modalita_pagamento}
                      onChange={handleChange("modalita_pagamento")}
                    />
                  </Field>

                  <Field
                    label="Scadenza pagamento"
                    error={errors.data_scadenza_pagamento}
                  >
                    <input
                      type="date"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.data_scadenza_pagamento ?? ""}
                      onChange={handleChange("data_scadenza_pagamento")}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* COORDINATE BANCARIE */}
            <section>
              <h3 className="text-lg font-semibold mb-4">
                Coordinate bancarie
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Field label="IBAN" error={errors.iban}>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm font-mono"
                      value={data.iban}
                      onChange={handleChange("iban")}
                    />
                  </Field>

                  <Field
                    label="Istituto bancario"
                    error={errors.istituto_bancario}
                  >
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.istituto_bancario}
                      onChange={handleChange("istituto_bancario")}
                    />
                  </Field>
                </div>

                <div>
                  <Field
                    label="Intestatario conto"
                    error={errors.intestatario_conto}
                  >
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                      value={data.intestatario_conto}
                      onChange={handleChange("intestatario_conto")}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* NOTE */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Note</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <Field label="Note interne" error={errors.note_interne}>
                  <textarea
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    value={data.note_interne}
                    onChange={handleChange("note_interne")}
                  />
                </Field>

                <Field label="Note esterne" error={errors.note_esterne}>
                  <textarea
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    value={data.note_esterne}
                    onChange={handleChange("note_esterne")}
                  />
                </Field>
              </div>
            </section>

            {/* AZIONI */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
                Annulla
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Salva modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
