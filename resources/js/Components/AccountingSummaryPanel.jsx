import React from "react";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";

const formatEUR = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

export default function AccountingSummaryPanel({
  queryParams = {},
  totals = { count: 0, sum_docs: 0, sum_paid: 0, sum_due: 0 },
  onFilterChange = () => {},
  onReset = () => {},
  names = { supplier: "name", date_from: "date_from", date_to: "date_to", status: "stato" },
}) {
  const n = { supplier: "name", date_from: "date_from", date_to: "date_to", status: "stato", ...names };

  const onKeyPress = (param, e) => {
    if (e.key !== "Enter") return;
    onFilterChange(param, e.target.value);
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-900 p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
        {/* Filtri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Fornitore</label>
            <TextInput
              className="w-full"
              defaultValue={queryParams[n.supplier] || ""}
              placeholder="Cerca fornitore…"
              onBlur={(e) => onFilterChange(n.supplier, e.target.value)}
              onKeyPress={(e) => onKeyPress(n.supplier, e)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Data da</label>
            <TextInput
              type="date"
              className="w-full"
              defaultValue={queryParams[n.date_from] || ""}
              onChange={(e) => onFilterChange(n.date_from, e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Data a</label>
            <TextInput
              type="date"
              className="w-full"
              defaultValue={queryParams[n.date_to] || ""}
              onChange={(e) => onFilterChange(n.date_to, e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Stato pagamento</label>
            <SelectInput
              className="w-full"
              defaultValue={queryParams[n.status] || ""}
              onChange={(e) => onFilterChange(n.status, e.target.value)}
            >
              <option value="">Tutti</option>
              <option value="aperta">Aperta</option>
              <option value="pagata">Pagata</option>
              <option value="parziale">Parziale</option>
            </SelectInput>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReset}
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
          <div className="text-xs text-gray-500 dark:text-gray-400">Fatture</div>
          <div className="text-xl font-semibold">{totals.count ?? 0}</div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Totale documenti</div>
          <div className="text-xl font-semibold">{formatEUR(totals.sum_docs)}</div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Pagato</div>
          <div className="text-xl font-semibold">{formatEUR(totals.sum_paid)}</div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Residuo</div>
          <div className="text-xl font-semibold">{formatEUR(totals.sum_due)}</div>
        </div>
      </div>
    </div>
  );
}
