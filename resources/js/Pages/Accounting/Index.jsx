import React from "react";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SelectInput from "@/Components/SelectInput";
import { Head, Link, router } from "@inertiajs/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";
import {
  ACCOUNTING_STATUS_CLASS_MAP,
  ACCOUNTING_STATUS_TEXT_MAP,
} from "@/constants.jsx";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

// === Helper: converte "YYYY-MM-DD" (o ISO) -> "gg/mm/aaaa"
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

// === Calcola quanto è stato pagato e quanto resta da pagare per una fattura
const computePaidSummary = (accounting) => {
  const details = accounting?.detail_accounting || [];

  const total = Number(accounting?.ImportoTotaleDocumento ?? 0);
  if (Number.isNaN(total)) {
    return {
      total: 0,
      paid: 0,
      due: 0,
    };
  }

  if (!details.length) {
    return {
      total,
      paid: 0,
      due: total,
    };
  }

  // Per le note di credito (TD04) gli importi sono negativi
  const sign = accounting?.TipoDocumento === "TD04" ? -1 : 1;

  // Sommo solo le righe con stato = "pagata"
  const paid = details
    .filter((d) => d.stato === "pagata")
    .reduce((sum, d) => {
      const v = Number(d.importoPagamento ?? 0);
      if (Number.isNaN(v)) return sum;
      return sum + sign * v;
    }, 0);

  const due = total - paid;

  return { total, paid, due };
};

// === Calcola lo stato "di testata" in base a Totale / Pagato / Da pagare
const computeAccountingStatus = (accounting) => {
  const { total, paid, due } = computePaidSummary(accounting);
  const EPS = 0.005; // tolleranza centesimi

  // Pagato ≈ 0  => Da saldare
  if (Math.abs(paid) < EPS) {
    return "aperta";
  }

  // Da pagare ≈ 0 => Pagata
  if (Math.abs(due) < EPS) {
    return "pagata";
  }

  // Negli altri casi => parzialmente saldata
  return "parziale";
};

// Testo custom per lo stato di testata
const accountingStatusLabel = (status) => {
  if (!status) return "";
  if (status === "aperta") return "Da saldare";
  if (status === "parziale") return "Parzialmente";
  // "pagata" e altri eventuali stati vanno dal map
  return ACCOUNTING_STATUS_TEXT_MAP[status] || status;
};

export default function Index({
  auth,
  accountings,
  queryParams = null,
  success,
  totals = null,
}) {
  queryParams = queryParams || {};
  totals = totals || { count: 0, sum_docs: 0, sum_paid: 0, sum_due: 0 };

  // toggle per mostrare/nascondere tutte le righe pagamento
  const [hideDetails, setHideDetails] = React.useState(false);

  const searchFieldChanged = (name, value) => {
    const next = { ...queryParams };
    if (value) next[name] = value;
    else delete next[name];
    next.page = 1;
    router.get(route("accounting.index"), next, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    router.get(route("accounting.index"), {}, {
      preserveState: false,
      replace: true,
    });
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
    router.get(route("accounting.index"), next, {
      preserveState: true,
      replace: true,
    });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    searchFieldChanged(name, e.target.value);
  };

  const deleteAccounting = (a) => {
    if (!window.confirm("Vuoi eliminare la fattura acquisto?")) return;
    router.delete(route("accounting.destroy", a.id));
  };

  const deleteDetail = (detail) => {
    if (!window.confirm("Vuoi eliminare la riga pagamento?")) return;
    router.delete(route("detailaccounting.destroy", detail.id), {
      preserveScroll: true,
    });
  };

  const addDetailRow = (accountingId) => {
    router.post(route("accounting.details.store", accountingId), {
      stato: "aperta",
      modalitaPagamento: "",
      tipoPagamento: null,
      dataScadenzaPagamento: null,
      importoPagamento: null,
      note: "",
    });
  };

    const handleExportXlsx = () => {
    const params = new URLSearchParams();

    // Usa esattamente gli stessi queryParams che già usi per i filtri
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    // Stato del toggle Nascondi righe pagamento
    params.set("hideDetails", hideDetails ? 1 : 0);

    // Se usi Ziggy, route('accounting.export') è ok
    const url = route("accounting.export") + "?" + params.toString();

    // Forzo il download
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

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Contabilità
          </h2>
          <Link
            href={route("accounting.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-600 rounded shadow hover:bg-emerald-400 hover:text-white"
          >
            Importa Fattura Acquisto
          </Link>
        </div>
      }
    >
      <Head title="Contabilità" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* ===== PANNELLO FILTRI + TOTALI ===== */}
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-900 p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
              {/* Filtri rapidi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 items-end">
                {/* Fornitore */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Fornitore
                  </label>
                  <TextInput
                    className="w-full"
                    defaultValue={queryParams.name || queryParams.nome || ""}
                    placeholder="Cerca fornitore…"
                    onBlur={(e) => searchFieldChanged("name", e.target.value)}
                    onKeyPress={(e) => onKeyPress("name", e)}
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

                {/* Scadenza da */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Scadenza da
                  </label>
                  <TextInput
                    type="date"
                    className="w-full"
                    defaultValue={queryParams.due_from || ""}
                    onChange={(e) =>
                      searchFieldChanged("due_from", e.target.value)
                    }
                  />
                </div>

                {/* Scadenza a */}
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Scadenza a
                  </label>
                  <TextInput
                    type="date"
                    className="w-full"
                    defaultValue={queryParams.due_to || ""}
                    onChange={(e) =>
                      searchFieldChanged("due_to", e.target.value)
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
                    <option value="TD04">Nota di credito (TD04)</option>
                  </SelectInput>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-300
                             hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  Reset filtri
                </button>
              </div>
            </div>

            {/* Totali */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fatture
                </div>
                <div className="text-xl font-semibold">{totals.count ?? 0}</div>
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
                  Pagato
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

          {/* ===== TABELLA ===== */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full table-fixed text-left text-sm text-gray-600 dark:text-gray-300">
                <colgroup>
                  <col className="w-[12ch]" /> {/* PROGRESSIVO */}
                  <col /> {/* FORNITORE */}
                  <col className="w-[14ch]" /> {/* NUMERO */}
                  <col className="w-[14ch]" /> {/* DATA */}
                  <col className="w-[12ch]" /> {/* TOTALE */}
                  <col className="w-[12ch]" /> {/* STATO */}
                  <col className="w-[10ch]" /> {/* AZIONI */}
                </colgroup>

                <thead>
                  {/* Riga intestazioni */}
                  <tr className="text-xs uppercase text-gray-700 bg-transparent">
                    {headCell("PROGRESSIVO", "Progressivo")}
                    {headCell("FORNITORE", "FornitoreNome")}
                    {headCell("NUMERO", "Numero")}
                    {headCell("DATA", "Data")}
                    {headCell("TOTALE", "ImportoTotaleDocumento")}
                    <th className="px-3 py-2 whitespace-nowrap">STATO</th>
                    <th className="px-3 py-2 whitespace-nowrap">AZIONI</th>
                  </tr>

                  {/* Riga filtri della tabella (per colonne) */}
                  <tr className="text-nowrap align-bottom">
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.progressivo}
                        placeholder="Progressivo"
                        onBlur={(e) =>
                          searchFieldChanged("progressivo", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("progressivo", e)}
                      />
                    </th>
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name || queryParams.nome}
                        placeholder="Fornitore"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.numero}
                        placeholder="Numero"
                        onBlur={(e) =>
                          searchFieldChanged("numero", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("numero", e)}
                      />
                    </th>

                    {/* DATA documento – due campi verticali: DA / A */}
                    <th className="px-3 pb-3 pt-1 align-top">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs flex items-center gap-2">
                          <span>Da</span>
                          <TextInput
                            type="date"
                            className="max-h-7"
                            defaultValue={queryParams.date_from || ""}
                            onChange={(e) =>
                              searchFieldChanged("date_from", e.target.value)
                            }
                          />
                        </label>
                        <label className="text-xs flex items-center gap-2">
                          <span>A</span>
                          <TextInput
                            type="date"
                            className="max-h-7"
                            defaultValue={queryParams.date_to || ""}
                            onChange={(e) =>
                              searchFieldChanged("date_to", e.target.value)
                            }
                          />
                        </label>
                      </div>
                    </th>

                    {/* placeholder TOTALE (nessun filtro) */}
                    <th className="px-3 pb-3 pt-1"></th>

                    {/* STATO */}
                    <th className="px-3 pb-3 pt-1">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.stato || ""}
                        onChange={(e) =>
                          searchFieldChanged("stato", e.target.value)
                        }
                      >
                        <option value="">Stato</option>
                        <option value="aperta">Da saldare</option>
                        <option value="pagata">Pagata</option>
                        <option value="parziale">Parziale</option>
                      </SelectInput>
                    </th>

                                       {/* AZIONI: toggle "Nascondi righe pagamento" + bottone export */}
                    <th className="px-3 pb-3 pt-1 text-center align-middle">
                      <div className="flex flex-col items-center gap-2">
                        <label className="inline-flex items-center gap-1 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="border-gray-300"
                            checked={hideDetails}
                            onChange={() => setHideDetails((prev) => !prev)}
                          />
                          <span>Nascondi righe</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleExportXlsx}
                          className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded-md shadow-sm
                                     bg-white hover:bg-gray-50"
                        >
                          Esporta XLSX
                        </button>
                      </div>
                    </th>

                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan={7} className="h-3"></td>
                  </tr>

                  {accountings.data.map((a, index) => {
                    const headerStatus = computeAccountingStatus(a);
                    const { total, paid, due } = computePaidSummary(a);
                    const hasDetails =
                      Array.isArray(a.detail_accounting) &&
                      a.detail_accounting.length > 0;

                    return (
                      <React.Fragment key={a.id}>
                        {/* Riga nera spessa tra una fattura e l’altra (solo se NON nascondiamo le righe) */}
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
                                  <col className="w-[12ch]" /> {/* PROGRESSIVO */}
                                  <col /> {/* FORNITORE */}
                                  <col className="w-[14ch]" /> {/* NUMERO */}
                                  <col className="w-[14ch]" /> {/* DATA */}
                                  <col className="w-[12ch]" /> {/* TOTALE */}
                                  <col className="w-[12ch]" /> {/* STATO */}
                                  <col className="w-[10ch]" /> {/* AZIONI */}
                                </colgroup>

                                <tbody>
                                  {/* Riga documento */}
                                  <tr className="border-b dark:border-gray-700 hover:bg-purple-50/50">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {a.Progressivo}
                                    </td>
                                    <td className="px-3 py-2">
                                      {a.FornitoreNome}
                                    </td>

                                    {/* Numero + badge NC */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {a.Numero}
                                      {a.TipoDocumento === "TD04" && (
                                        <span className="ml-2 inline-block text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
                                          NC
                                        </span>
                                      )}
                                    </td>

                                    {/* Data gg/mm/aaaa */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {fmtDateIT(a.Data)}
                                    </td>

                                    {/* Totale documento */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {formatEUR(a.ImportoTotaleDocumento)}
                                    </td>

                                    {/* STATO testata */}
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

                                    {/* AZIONI */}
                                    <td className="px-3 py-2 text-nowrap">
                                      <div className="flex gap-2">
                                        <Link
                                          href={route("accounting.show", {
                                            accounting: a.id,
                                            ...queryParams,
                                          })}
                                          className="text-emerald-600"
                                        >
                                          <EyeIcon className="w-5 h-5" />
                                        </Link>
                                        <Link
                                          href={route("accounting.edit", {
                                            accounting: a.id,
                                            ...queryParams,
                                          })}
                                          className="text-blue-600"
                                        >
                                          <PencilSquareIcon className="w-5 h-5" />
                                        </Link>
                                        <button
                                          onClick={() => deleteAccounting(a)}
                                          className="text-red-500"
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Riepilogo Totale / Pagato / Da pagare
                                      - se ci sono righe pagamento (hasDetails)
                                      - OPPURE se NON ci sono righe ma hideDetails è attivo,
                                        così “Stato pagamenti” resta visibile nel caso 0 righe */}
                                  {(hasDetails || (!hasDetails && hideDetails)) && (
                                    <tr>
                                      <td
                                        colSpan={7}
                                        className="px-3 pt-2 pb-3 text-xs text-gray-700 dark:text-gray-300 bg-slate-50/60 dark:bg-slate-900/40 border-b border-dashed border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex flex-wrap items-center gap-4">
                                            <span className="font-semibold uppercase tracking-wide">
                                              Stato pagamenti
                                            </span>
                                            <span>
                                              Totale documento:{" "}
                                              <span className="font-semibold">
                                                {formatEUR(total)}
                                              </span>
                                            </span>
                                            <span>
                                              Pagato:{" "}
                                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                {formatEUR(paid)}
                                              </span>
                                            </span>
                                            <span>
                                              Da pagare:{" "}
                                              <span className="font-semibold text-rose-700 dark:text-rose-400">
                                                {formatEUR(due)}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {/* RIGHE PAGAMENTO:
                                      - nascoste COMPLETAMENTE se hideDetails = true
                                      - se hideDetails = false: sempre mostra intestazione + bottone
                                        e, solo se hasDetails, anche la tabella */}
                                  {!hideDetails && (
                                    <tr>
                                      <td colSpan={7} className="pt-2">
                                        <div className="flex justify-between items-center">
                                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                            Righe pagamento
                                          </div>

                                          <button
                                            onClick={() => addDetailRow(a.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold
                                                        bg-amber-100 text-orange-600 border border-amber-200 shadow-sm
                                                        hover:bg-amber-200 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                          >
                                            <span className="text-sm leading-none">
                                              +
                                            </span>
                                            Aggiungi riga
                                          </button>
                                        </div>

                                        {hasDetails && (
                                          <table className="w-full table-fixed text-center text-sm text-gray-600 dark:text-gray-300 border mt-2 rounded-md overflow-hidden">
                                            <colgroup>
                                              <col className="w-[12ch]" />
                                              <col className="w-[24ch]" />
                                              <col className="w-[20ch]" />
                                              <col className="w-[16ch]" />
                                              <col className="w-[14ch]" />
                                              <col />
                                              <col className="w-[10ch]" />
                                            </colgroup>
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700">
                                              <tr>
                                                <th className="px-3 py-2">STATO</th>
                                                <th className="px-3 py-2">
                                                  MODALITÀ PAGAMENTO
                                                </th>
                                                <th className="px-3 py-2">
                                                  TIPO PAGAMENTO
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
                                              {a.detail_accounting.map((d) => (
                                                <tr
                                                  key={d.id}
                                                  className="bg-white dark:bg-gray-800"
                                                >
                                                  <td className="px-3 py-2">
                                                    <span
                                                      className={
                                                        "px-2 py-1 rounded text-white " +
                                                        ACCOUNTING_STATUS_CLASS_MAP[d.stato]
                                                      }
                                                    >
                                                      {
                                                        ACCOUNTING_STATUS_TEXT_MAP[
                                                          d.stato
                                                        ]
                                                      }
                                                    </span>
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {d.modalitaPagamento}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {d.tipoPagamento || "-"}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {fmtDateIT(
                                                      d.dataScadenzaPagamento
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {formatEUR(
                                                      (a.TipoDocumento === "TD04"
                                                        ? -1
                                                        : 1) *
                                                        Number(
                                                          d.importoPagamento ??
                                                            0
                                                        )
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {d.note || ""}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-2">
                                                      <Link
                                                        href={route(
                                                          "detailaccounting.edit",
                                                          {
                                                            detail: d.id,
                                                            ...queryParams,
                                                          }
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Modifica riga"
                                                      >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                      </Link>
                                                      <button
                                                        onClick={() =>
                                                          deleteDetail(d)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Elimina riga"
                                                        aria-label="Elimina riga"
                                                      >
                                                        <TrashIcon className="w-5 h-5" />
                                                      </button>
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

              <Pagination links={accountings.meta.links} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
