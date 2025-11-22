import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import Pagination from "@/Components/Pagination";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/16/solid";
import {
  ACCOUNTING_STATUS_CLASS_MAP,
  ACCOUNTING_STATUS_TEXT_MAP,
} from "@/constants.jsx";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

const fmtDateIT = (val) => {
  if (!val) return "";
  const s = String(val);

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return s;
};

// Totale con segno coerente
const signedTotal = (inv) => {
  const raw = Number(inv?.totale_documento ?? 0);
  if (Number.isNaN(raw)) return 0;
  return inv?.tipo_documento === "TD04" ? -Math.abs(raw) : Math.abs(raw);
};

// Calcola Totale / Pagato / Da pagare per fattura vendita
const computePaidSummary = (invoice) => {
  const total = signedTotal(invoice);
  const payments = Array.isArray(invoice?.payments) ? invoice.payments : [];

  // Nota di credito => importi pagati visti con segno coerente
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

export default function Index({
  auth,
  invoices,
  queryParams = null,
  success,
  totals = null,
}) {
  queryParams = queryParams || {};
  totals = totals || { count: 0, sum_docs: 0, sum_paid: 0, sum_due: 0 };

  const [hideDetails, setHideDetails] = React.useState(false);

  const searchFieldChanged = (name, value) => {
    const next = { ...queryParams };
    if (value) next[name] = value;
    else delete next[name];
    next.page = 1;

    router.get(route("salesinvoice.index"), next, {
      preserveState: true,
      replace: true,
    });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    searchFieldChanged(name, e.target.value);
  };

  const resetFilters = () => {
    router.get(
      route("salesinvoice.index"),
      {},
      {
        preserveState: false,
        replace: true,
      }
    );
  };

  const sortChanged = (name) => {
    const next = { ...queryParams };
    if (name === next.sort_field) {
      next.sort_direction = next.sort_direction === "asc" ? "desc" : "asc";
    } else {
      next.sort_field = name;
      next.sort_direction = "asc";
    }
    next.page = 1;
    router.get(route("salesinvoice.index"), next, {
      preserveState: true,
      replace: true,
    });
  };

  const deleteInvoice = (inv) => {
    if (!window.confirm("Vuoi eliminare la fattura di vendita?")) return;
    router.delete(route("salesinvoice.destroy", inv.id));
  };

  const addPaymentRow = (invoiceId) => {
    router.post(route("salesinvoice.payments.store", invoiceId), {
      stato: "aperta",
      modalita_pagamento: "",
      tipo_pagamento: null,
      data_scadenza_pagamento: null,
      importo_pagamento: null,
      note: "",
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    params.set("hideDetails", hideDetails ? 1 : 0);

    const url = route("salesinvoice.export") + "?" + params.toString();
    window.location.href = url;
  };

  const headCell = (label, field) => (
    <th
      onClick={() => sortChanged(field)}
      className="whitespace-nowrap align-middle"
    >
      <div className="px-3 py-2 grid grid-cols-[1fr,16px] items-center gap-1 cursor-pointer select-none">
        <span className="truncate">{label}</span>
        <span className="flex flex-col items-center leading-none shrink-0">
          <ChevronUpIcon
            className={
              "w-4 h-4 " +
              (queryParams.sort_field === field &&
              queryParams.sort_direction === "asc"
                ? "text-black"
                : "text-gray-400")
            }
          />
          <ChevronDownIcon
            className={
              "w-4 h-4 -mt-[2px] " +
              (queryParams.sort_field === field &&
              queryParams.sort_direction === "desc"
                ? "text-black"
                : "text-gray-400")
            }
          />
        </span>
      </div>
    </th>
  );

  // Links paginazione in modo robusto
  const paginationLinks =
    invoices?.meta?.links ?? invoices?.links ?? [];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Fatture di vendita
          </h2>

          {/* <div className="flex gap-2">
            <Link
              href={route("work.index")}
              className="bg-sky-100 py-1 px-3 text-sky-700 rounded shadow hover:bg-sky-200 hover:text-sky-900"
            >
              Vai ai lavori
            </Link>
          </div> */}
        </div>
      }
    >
      <Head title="Fatture di vendita" />

      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded mb-4">
          {success}
        </div>
      )}

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* FILTRI + TOTALI */}
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-900 p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
              {/* Filtri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 items-end">
                {/* Cliente */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Cliente
                  </label>
                  <TextInput
                    className="w-full"
                    defaultValue={queryParams.cliente || ""}
                    placeholder="Cerca cliente…"
                    onBlur={(e) =>
                      searchFieldChanged("cliente", e.target.value)
                    }
                    onKeyPress={(e) => onKeyPress("cliente", e)}
                  />
                </div>

                {/* Numero */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Numero
                  </label>
                  <TextInput
                    className="w-full"
                    defaultValue={queryParams.numero || ""}
                    placeholder="Numero"
                    onBlur={(e) =>
                      searchFieldChanged("numero", e.target.value)
                    }
                    onKeyPress={(e) => onKeyPress("numero", e)}
                  />
                </div>

                {/* Anno */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Anno
                  </label>
                  <TextInput
                    type="number"
                    className="w-full"
                    defaultValue={queryParams.anno || ""}
                    onBlur={(e) => searchFieldChanged("anno", e.target.value)}
                    onKeyPress={(e) => onKeyPress("anno", e)}
                  />
                </div>

                {/* Data documento da */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Data da
                  </label>
                  <TextInput
                    type="date"
                    className="w-full"
                    defaultValue={queryParams.date_from || ""}
                    onChange={(e) =>
                      searchFieldChanged("date_from", e.target.value)
                    }
                  />
                </div>

                {/* Data documento a */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Data a
                  </label>
                  <TextInput
                    type="date"
                    className="w-full"
                    defaultValue={queryParams.date_to || ""}
                    onChange={(e) =>
                      searchFieldChanged("date_to", e.target.value)
                    }
                  />
                </div>

                {/* Stato pagamento */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Stato pagamento
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.stato || ""}
                    onChange={(e) =>
                      searchFieldChanged("stato", e.target.value)
                    }
                  >
                    <option value="">Tutti</option>
                    <option value="aperta">Da saldare</option>
                    <option value="pagata">Pagata</option>
                    <option value="parziale">Parziale</option>
                  </SelectInput>
                </div>

                {/* Tipo documento */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Tipo documento
                  </label>
                  <SelectInput
                    className="w-full"
                    defaultValue={queryParams.tipo_documento || ""}
                    onChange={(e) =>
                      searchFieldChanged("tipo_documento", e.target.value)
                    }
                  >
                    <option value="">Tutti</option>
                    <option value="TD01">Fattura (TD01)</option>
                    <option value="TD02">Acconto/Anticipo (TD02)</option>
                    <option value="TD04">Nota di credito (TD04)</option>
                  </SelectInput>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-300
                             hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  Reset filtri
                </button>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="border-gray-300"
                      checked={hideDetails}
                      onChange={() => setHideDetails((prev) => !prev)}
                    />
                    <span>Nascondi rate</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-300 rounded-md shadow-sm
                               bg-white hover:bg-gray-50"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Esporta XLSX
                  </button>
                </div>
              </div>
            </div>

            {/* Totali */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fatture
                </div>
                <div className="text-xl font-semibold">
                  {totals.count ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Totale documenti
                </div>
                <div className="text-xl font-semibold">
                  {formatEUR(totals.sum_docs)}
                </div>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Incassato
                </div>
                <div className="text-xl font-semibold">
                  {formatEUR(totals.sum_paid)}
                </div>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Residuo
                </div>
                <div className="text-xl font-semibold">
                  {formatEUR(totals.sum_due)}
                </div>
              </div>
            </div>
          </div>

          {/* TABELLA */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full table-fixed text-left text-sm text-gray-600 dark:text-gray-300">
                <colgroup>
                  <col className="w-[18ch]" /> {/* NUMERO COMPLETO */}
                  <col /> {/* CLIENTE */}
                  <col className="w-[14ch]" /> {/* DATA */}
                  <col className="w-[12ch]" /> {/* TOTALE */}
                  <col className="w-[12ch]" /> {/* STATO */}
                  <col className="w-[14ch]" /> {/* SDI */}
                  <col className="w-[10ch]" /> {/* AZIONI */}
                </colgroup>

                <thead>
                  <tr className="text-xs uppercase text-gray-700 bg-transparent">
                    {headCell("NUMERO", "numero")}
                    {headCell("CLIENTE", "cliente")}
                    {headCell("DATA", "data_documento")}
                    {headCell("TOTALE", "totale_documento")}
                    <th className="px-3 py-2 whitespace-nowrap">STATO</th>
                    <th className="px-3 py-2 whitespace-nowrap">SDI</th>
                    <th className="px-3 py-2 whitespace-nowrap">AZIONI</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan={7} className="h-3"></td>
                  </tr>

                  {(invoices?.data ?? []).map((inv, index) => {
                    const headerStatus = computeHeaderStatus(inv);
                    const { total, paid, due } = computePaidSummary(inv);
                    const hasPayments =
                      Array.isArray(inv.payments) &&
                      inv.payments.length > 0;

                    return (
                      <React.Fragment key={inv.id}>
                        {!hideDetails && index > 0 && (
                          <tr>
                            <td colSpan={7}>
                              <div className="h-1 bg-black my-4 rounded-full" />
                            </td>
                          </tr>
                        )}

                        <tr>
                          <td colSpan={7} className="align-top">
                            <div className="mb-6 rounded-xl border border-sky-100 bg-slate-50/40 px-3 pt-3 pb-4">
                              <table className="w-full table-fixed text-left text-sm text-gray-600 dark:text-gray-300">
                                <colgroup>
                                  <col className="w-[18ch]" />
                                  <col />
                                  <col className="w-[14ch]" />
                                  <col className="w-[12ch]" />
                                  <col className="w-[12ch]" />
                                  <col className="w-[14ch]" />
                                  <col className="w-[10ch]" />
                                </colgroup>

                                <tbody>
                                  {/* Riga fattura */}
                                  <tr className="border-b dark:border-gray-700 hover:bg-purple-50/50">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {inv.numero_completo ??
                                        `${inv.numero}/${inv.anno}`}
                                      {inv.tipo_documento === "TD04" && (
                                        <span className="ml-2 inline-block text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
                                          NC
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {inv.client?.name || "-"}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {fmtDateIT(inv.data_documento)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {formatEUR(total)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={
                                          "px-2 py-1 rounded text-white " +
                                          ACCOUNTING_STATUS_CLASS_MAP[
                                            headerStatus
                                          ]
                                        }
                                      >
                                        {accountingStatusLabel(headerStatus)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {inv.sdi_status ? (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                          {inv.sdi_status}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-nowrap">
                                      <div className="flex gap-2">
                                        <Link
                                          href={route("salesinvoice.show", {
                                            salesinvoice: inv.id,
                                            ...queryParams,
                                          })}
                                          className="text-emerald-600"
                                        >
                                          <EyeIcon className="w-5 h-5" />
                                        </Link>
                                        <Link
                                          href={route("salesinvoice.edit", {
                                            salesinvoice: inv.id,
                                            ...queryParams,
                                          })}
                                          className="text-blue-600"
                                        >
                                          <PencilSquareIcon className="w-5 h-5" />
                                        </Link>
                                        <button
                                          onClick={() => deleteInvoice(inv)}
                                          className="text-red-500"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Riepilogo pagamenti */}
                                  {(hasPayments ||
                                    (!hasPayments && hideDetails)) && (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="px-3 pt-2 pb-3 text-xs text-gray-700 dark:text-gray-300 bg-slate-50/60 dark:bg-slate-900/40 border-b border-dashed border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex flex-wrap items-center gap-4">
                                            <span className="font-semibold uppercase tracking-wide">
                                              Stato incassi
                                            </span>
                                            <span>
                                              Totale documento:{" "}
                                              <span className="font-semibold">
                                                {formatEUR(total)}
                                              </span>
                                            </span>
                                            <span>
                                              Incassato:{" "}
                                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                {formatEUR(paid)}
                                              </span>
                                            </span>
                                            <span>
                                              Da incassare:{" "}
                                              <span className="font-semibold text-rose-700 dark:text-rose-400">
                                                {formatEUR(due)}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {/* Rate di pagamento */}
                                  {!hideDetails && (
                                    <tr>
                                      <td colSpan={7} className="pt-2">
                                        <div className="flex justify-between items-center">
                                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            Rate / Scadenze
                                          </div>

                                          <button
                                            onClick={() =>
                                              addPaymentRow(inv.id)
                                            }
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold
                                                        bg-amber-100 text-orange-600 border border-amber-200 shadow-sm
                                                        hover:bg-amber-200 hover:text-orange-700"
                                          >
                                            <span className="text-sm leading-none">
                                              +
                                            </span>
                                            Aggiungi rata
                                          </button>
                                        </div>

                                        {hasPayments && (
                                          <table className="w-full table-fixed text-center text-sm text-gray-600 dark:text-gray-300 border mt-2 rounded-md overflow-hidden">
                                            <colgroup>
                                              <col className="w-[12ch]" />
                                              <col className="w-[20ch]" />
                                              <col className="w-[16ch]" />
                                              <col className="w-[14ch]" />
                                              <col />
                                              <col className="w-[10ch]" />
                                            </colgroup>
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700">
                                              <tr>
                                                <th className="px-3 py-2">
                                                  STATO
                                                </th>
                                                <th className="px-3 py-2">
                                                  MODALITÀ
                                                </th>
                                                <th className="px-3 py-2">
                                                  DATA SCADENZA
                                                </th>
                                                <th className="px-3 py-2">
                                                  IMPORTO
                                                </th>
                                                <th className="px-3 py-2">
                                                  NOTE
                                                </th>
                                                <th className="px-3 py-2">
                                                  AZIONI
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {inv.payments.map((p) => (
                                                <tr
                                                  key={p.id}
                                                  className="bg-white dark:bg-gray-800"
                                                >
                                                  <td className="px-3 py-2">
                                                    <span
                                                      className={
                                                        "px-2 py-1 rounded text-white " +
                                                        ACCOUNTING_STATUS_CLASS_MAP[
                                                          p.stato
                                                        ]
                                                      }
                                                    >
                                                      {
                                                        ACCOUNTING_STATUS_TEXT_MAP[
                                                          p.stato
                                                        ]
                                                      }
                                                    </span>
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {p.modalita_pagamento ||
                                                      "-"}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {fmtDateIT(
                                                      p.data_scadenza_pagamento
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {formatEUR(
                                                      (inv.tipo_documento ===
                                                      "TD04"
                                                        ? -1
                                                        : 1) *
                                                        Number(
                                                          p.importo_pagamento ??
                                                            0
                                                        )
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {p.note || ""}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-2">
                                                      <Link
                                                        href={route(
                                                          "salesinvoice.payments.edit",
                                                          {
                                                            payment: p.id,
                                                            ...queryParams,
                                                          }
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Modifica rata"
                                                      >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                      </Link>
                                                      {/* cancel rata da show, non da index */}
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <Pagination links={paginationLinks} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
