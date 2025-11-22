import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/16/solid";
import {
  ACCOUNTING_STATUS_CLASS_MAP,
  ACCOUNTING_STATUS_TEXT_MAP,
} from "@/constants.jsx";

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

const signedTotal = (inv) => {
  const raw = Number(inv?.totale_documento ?? 0);
  if (Number.isNaN(raw)) return 0;
  return inv?.tipo_documento === "TD04" ? -Math.abs(raw) : Math.abs(raw);
};

const computePaidSummary = (invoice) => {
  const total = signedTotal(invoice);
  const payments = Array.isArray(invoice?.payments) ? invoice.payments : [];

  const sign = invoice?.tipo_documento === "TD04" ? -1 : 1;

  const paid = payments
    .filter((p) => p.stato === "pagata")
    .reduce((sum, p) => {
      const v = Number(p.importo_pagamento ?? 0);
      if (Number.isNaN(v)) return sum;
      return sum + sign * v;
    }, 0);

  const due = total - paid;

  return { total, paid, due };
};

const computeHeaderStatus = (invoice) => {
  const { paid, due } = computePaidSummary(invoice);
  const EPS = 0.005;

  if (Math.abs(paid) < EPS) return "aperta";
  if (Math.abs(due) < EPS) return "pagata";
  return "parziale";
};

const accountingStatusLabel = (status) => {
  if (!status) return "";
  if (status === "aperta") return "Da saldare";
  if (status === "parziale") return "Parzialmente";
  return ACCOUNTING_STATUS_TEXT_MAP[status] || status;
};

const Row = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2 border-b last:border-b-0">
    <div className="col-span-1 text-xs text-gray-500">{label}</div>
    <div
      className={`col-span-2 sm:col-span-3 text-sm ${
        mono ? "font-mono" : ""
      }`}
    >
      {value ?? "-"}
    </div>
  </div>
);

export default function Show({ auth, invoice, backQuery = null }) {
  const inv = invoice ?? {};

  const backHref = backQuery
    ? route("salesinvoice.index", backQuery)
    : route("salesinvoice.index");

  const { total, paid, due } = computePaidSummary(inv);
  const headerStatus = computeHeaderStatus(inv);

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Fattura vendita #${inv?.id ?? ""}`} />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Fattura di vendita{" "}
              {inv?.id ? (
                <span className="text-gray-400">#{inv.id}</span>
              ) : null}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {inv?.tipo_documento && (
                <span
                  className={
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
                    (inv.tipo_documento === "TD04"
                      ? "bg-pink-50 text-pink-700 border-pink-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200")
                  }
                >
                  {inv.tipo_documento === "TD04"
                    ? "Nota di credito (TD04)"
                    : inv.tipo_documento === "TD02"
                    ? "Acconto/Anticipo (TD02)"
                    : "Fattura (TD01)"}
                </span>
              )}

              <span
                className={
                  "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold text-white " +
                  (ACCOUNTING_STATUS_CLASS_MAP[headerStatus] || "bg-gray-500")
                }
              >
                {accountingStatusLabel(headerStatus)}
              </span>

              {inv?.sdi_status && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                  SDI: {inv.sdi_status}
                </span>
              )}

              {inv?.locked_at && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                  Bloccata
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {inv?.xml_path && inv?.id && (
              <a
                href={route("salesinvoice.xml", { salesInvoice: inv.id })}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Scarica XML
              </a>
            )}
            {inv?.pdf_path && inv?.id && (
              <a
                href={route("salesinvoice.pdf", { salesInvoice: inv.id })}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Scarica PDF
              </a>
            )}
            {inv?.id && (
              <Link
                href={route("salesinvoice.edit", {
                  salesinvoice: inv.id,
                  ...(backQuery || {}),
                })}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Modifica
              </Link>
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

        {/* Documento */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Documento</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Row
                  label="Numero completo"
                  value={inv.numero_completo ?? `${inv.numero}/${inv.anno}`}
                />
                <Row label="Numero" value={inv.numero} />
                <Row label="Anno" value={inv.anno} />
                <Row label="Serie" value={inv.serie} />
                <Row label="Data" value={fmtDateIT(inv.data_documento)} />
                <Row label="Valuta" value={inv.valuta} />
                <Row label="Cambio" value={inv.cambio} />
              </div>
              <div>
                <Row label="Totale documento" value={formatEUR(total)} />
                <Row
                  label="Imponibile"
                  value={formatEUR(inv.imponibile_totale)}
                />
                <Row
                  label="Imposta"
                  value={formatEUR(inv.imposta_totale)}
                />
                <Row
                  label="Spese accessorie"
                  value={formatEUR(inv.spese_accessorie)}
                />
                <Row
                  label="Arrotondamento"
                  value={formatEUR(inv.arrotondamento)}
                />
                <Row
                  label="Totale da pagare"
                  value={formatEUR(inv.totale_da_pagare)}
                />
                <Row label="Origine" value={inv.origine} />
              </div>
            </div>
          </div>
        </div>

        {/* Cliente / Lavoro */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Cliente / Lavoro</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Row label="Cliente" value={inv.client?.name} />
                <Row
                  label="Cod. Fiscale"
                  value={inv.client?.cod_fiscale}
                  mono
                />
                <Row label="P.IVA" value={inv.client?.piva} mono />
              </div>
              <div>
                <Row
                  label="Lavoro"
                  value={
                    inv.work ? `${inv.work.id} - ${inv.work.name}` : "-"
                  }
                />
                <Row
                  label="Condizioni pagamento"
                  value={inv.condizioni_pagamento}
                />
                <Row
                  label="Modalità pagamento"
                  value={inv.modalita_pagamento}
                />
                <Row
                  label="Scadenza pagamento"
                  value={fmtDateIT(inv.data_scadenza_pagamento)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coordinate bancarie */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Coordinate bancarie</h2>
          </div>
          <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
            <div>
              <Row label="IBAN" value={inv.iban} mono />
              <Row
                label="Istituto bancario"
                value={inv.istituto_bancario}
              />
              <Row
                label="Intestatario conto"
                value={inv.intestatario_conto}
              />
            </div>
            <div>
              <Row
                label="Ritenuta d'acconto"
                value={inv.has_withholding_tax ? "Sì" : "No"}
              />
              <Row label="Tipo ritenuta" value={inv.withholding_type} />
              <Row
                label="Aliquota ritenuta"
                value={
                  inv.withholding_rate != null
                    ? `${inv.withholding_rate}%`
                    : "-"
                }
              />
              <Row
                label="Importo ritenuta"
                value={formatEUR(inv.withholding_amount)}
              />
            </div>
          </div>
        </div>

        {/* Bollo */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Bollo</h2>
          </div>
          <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
            <div>
              <Row
                label="Bollo applicato"
                value={inv.bollo_applicato ? "Sì" : "No"}
              />
            </div>
            <div>
              <Row
                label="Importo bollo"
                value={formatEUR(inv.bollo_importo)}
              />
            </div>
          </div>
        </div>

        {/* Note */}
        {(inv.note_interne || inv.note_esterne) && (
          <div className="bg-white shadow-sm sm:rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Note</h2>
            </div>
            <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
              <div>
                <Row label="Note interne" value={inv.note_interne} />
              </div>
              <div>
                <Row label="Note esterne" value={inv.note_esterne} />
              </div>
            </div>
          </div>
        )}

        {/* Stato incassi + righe pagamento */}
        <div className="bg-white shadow-sm sm:rounded-lg">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">Incassi / Rate</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={
                  "inline-flex items-center rounded px-2 py-0.5 font-semibold text-white " +
                  (ACCOUNTING_STATUS_CLASS_MAP[headerStatus] ||
                    "bg-gray-500")
                }
              >
                {accountingStatusLabel(headerStatus)}
              </span>
              <span className="text-gray-600">
                Incassato:{" "}
                <span className="font-semibold text-emerald-700">
                  {formatEUR(paid)}
                </span>{" "}
                · Da incassare:{" "}
                <span className="font-semibold text-rose-700">
                  {formatEUR(due)}
                </span>
              </span>
            </div>
          </div>

          <div className="px-6 py-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Stato
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Modalità
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Scadenza
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Importo
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(inv.payments) && inv.payments.length ? (
                  inv.payments.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">
                        {p.stato ? (
                          <span
                            className={
                              "px-2 py-1 rounded text-white " +
                              ACCOUNTING_STATUS_CLASS_MAP[p.stato]
                            }
                          >
                            {ACCOUNTING_STATUS_TEXT_MAP[p.stato]}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {p.modalita_pagamento ?? "-"}
                      </td>
                      <td className="px-4 py-2">
                        {fmtDateIT(p.data_scadenza_pagamento)}
                      </td>
                      <td className="px-4 py-2">
                        {formatEUR(
                          (inv.tipo_documento === "TD04" ? -1 : 1) *
                            Number(p.importo_pagamento ?? 0)
                        )}
                      </td>
                      <td className="px-4 py-2">{p.note ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={5}
                    >
                      Nessuna rata di pagamento presente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
