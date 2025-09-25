import React from "react";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SelectInput from "@/Components/SelectInput";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";
import { ACCOUNTING_STATUS_CLASS_MAP, ACCOUNTING_STATUS_TEXT_MAP } from "@/constants.jsx";

export default function Index({ auth, accountings, queryParams = null, success }) {
  queryParams = queryParams || {};

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route("accounting.index"), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      queryParams.sort_direction = queryParams.sort_direction === "asc" ? "desc" : "asc";
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("accounting.index"), queryParams);
  };

  const deleteAccounting = (a) => {
    if (!window.confirm("Vuoi eliminare la fattura acquisto?")) return;
    router.delete(route("accounting.destroy", a.id));
  };

  // ⬇️ NUOVO: elimina una riga pagamento
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

  const headCell = (label, field) => (
    <th onClick={() => sortChanged(field)} className="whitespace-nowrap">
      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer select-none">
        {label}
        <div className="flex flex-col leading-none">
          <ChevronUpIcon
            className={
              "w-4 " +
              (queryParams.sort_field === field && queryParams.sort_direction === "asc" ? "text-black" : "text-gray-400")
            }
          />
          <ChevronDownIcon
            className={
              "w-4 -mt-1 " +
              (queryParams.sort_field === field && queryParams.sort_direction === "desc" ? "text-black" : "text-gray-400")
            }
          />
        </div>
      </div>
    </th>
  );

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Contabilita</h2>
          <Link
            href={route("accounting.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-600 rounded shadow hover:bg-emerald-400 hover:text-white"
          >
            Importa Fattura Acquisto
          </Link>
        </div>
      }
    >
      <Head title="Contabilita" />
      {success && <div className="bg-emerald-500 py-2 px-4 text-white rounded">{success}</div>}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full table-fixed text-left text-sm text-gray-600 dark:text-gray-300">
                <colgroup>
                  <col className="w-[12ch]" />
                  <col className="w-[16ch]" />
                  <col />
                  <col className="w-[14ch]" />
                  <col className="w-[14ch]" />
                  <col className="w-[12ch]" />
                  <col className="w-[12ch]" />
                  <col className="w-[10ch]" />
                </colgroup>

                <thead>
                  {/* Riga intestazioni */}
                  <tr className="text-xs uppercase text-gray-700 bg-transparent">
                    {headCell("PROGRESSIVO", "Progressivo")}
                    {headCell("PROGRESSIVO INVIO", "ProgressivoInvio")}
                    {headCell("FORNITORE", "FornitoreNome")}
                    {headCell("NUMERO", "Numero")}
                    {headCell("DATA", "Data")}
                    {headCell("TOTALE", "ImportoTotaleDocumento")}
                    <th className="px-3 py-2 whitespace-nowrap">STATO</th>
                    <th className="px-3 py-2 whitespace-nowrap">AZIONI</th>
                  </tr>

                  {/* Riga filtri */}
                  <tr className="text-nowrap align-bottom">
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.progressivo}
                        placeholder="Progressivo"
                        onBlur={(e) => searchFieldChanged("progressivo", e.target.value)}
                        onKeyPress={(e) => onKeyPress("progressivo", e)}
                      />
                    </th>
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.progressivoinvio}
                        placeholder="Progressivo Invio"
                        onBlur={(e) => searchFieldChanged("progressivoinvio", e.target.value)}
                        onKeyPress={(e) => onKeyPress("progressivoinvio", e)}
                      />
                    </th>
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name || queryParams.nome}
                        placeholder="Fornitore"
                        onBlur={(e) => searchFieldChanged("name", e.target.value)}
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 pb-3 pt-1">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.numero}
                        placeholder="Numero"
                        onBlur={(e) => searchFieldChanged("numero", e.target.value)}
                        onKeyPress={(e) => onKeyPress("numero", e)}
                      />
                    </th>

                    {/* DATA – due campi verticali: DA / A */}
                    <th className="px-3 pb-3 pt-1 align-top">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs flex items-center gap-2">
                          <span>Da</span>
                          <TextInput
                            type="date"
                            className="max-h-7"
                            defaultValue={queryParams.date_from || ""}
                            onChange={(e) => searchFieldChanged("date_from", e.target.value)}
                          />
                        </label>
                        <label className="text-xs flex items-center gap-2">
                          <span>A</span>
                          <TextInput
                            type="date"
                            className="max-h-7"
                            defaultValue={queryParams.date_to || ""}
                            onChange={(e) => searchFieldChanged("date_to", e.target.value)}
                          />
                        </label>
                      </div>
                    </th>

                    <th className="px-3 pb-3 pt-1"></th>

                    {/* STATO */}
                    <th className="px-3 pb-3 pt-1">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.stato || ""}
                        onChange={(e) => searchFieldChanged("stato", e.target.value)}
                      >
                        <option value="">Stato</option>
                        <option value="aperta">Aperta</option>
                        <option value="pagata">Pagata</option>
                        <option value="parziale">Parziale</option>
                      </SelectInput>
                    </th>
                    <th className="px-3 pb-3 pt-1"></th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan={8} className="h-3"></td>
                  </tr>

                  {accountings.data.map((a) => (
                    <React.Fragment key={a.id}>
                      <tr className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700">
                        <th className="px-3 py-2">Progressivo</th>
                        <th className="px-3 py-2">Progressivo Invio</th>
                        <th className="px-3 py-2">Fornitore</th>
                        <th className="px-3 py-2">Numero</th>
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2">Totale</th>
                        <th className="px-3 py-2">Stato</th>
                        <th className="px-3 py-2">Azioni</th>
                      </tr>

                      <tr className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-50">
                        <td className="px-3 py-2 whitespace-nowrap">{a.Progressivo}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{a.ProgressivoInvio}</td>
                        <td className="px-3 py-2">{a.FornitoreNome}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{a.Numero}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{a.Data}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{a.ImportoTotaleDocumento}</td>
                        <td className="px-3 py-2">
                          <span className={"px-2 py-1 rounded text-white " + ACCOUNTING_STATUS_CLASS_MAP[a.Stato]}>
                            {ACCOUNTING_STATUS_TEXT_MAP[a.Stato] || a.Stato}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-nowrap">
                          <div className="flex gap-2">
                            <Link href={route("accounting.edit", a.id)} className="text-blue-600">
                              <PencilSquareIcon className="w-5 h-5" />
                            </Link>
                            <button onClick={() => deleteAccounting(a)} className="text-red-500">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {a.detail_accounting && a.detail_accounting.length > 0 && (
                        <tr>
                          <td colSpan={8} className="pt-2">
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
                                <span className="text-sm leading-none">+</span>
                                Aggiungi riga
                              </button>
                            </div>

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
                                  <th className="px-3 py-2">MODALITA PAGAMENTO</th>
                                  <th className="px-3 py-2">TIPO PAGAMENTO</th>
                                  <th className="px-3 py-2">DATA SCADENZA</th>
                                  <th className="px-3 py-2">IMPORTO</th>
                                  <th className="px-3 py-2">NOTE</th>
                                  <th className="px-3 py-2">AZIONI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {a.detail_accounting.map((d) => (
                                  <tr key={d.id} className="bg-white dark:bg-gray-800">
                                    <td className="px-3 py-2">
                                      <span className={"px-2 py-1 rounded text-white " + ACCOUNTING_STATUS_CLASS_MAP[d.stato]}>
                                        {ACCOUNTING_STATUS_TEXT_MAP[d.stato]}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">{d.modalitaPagamento}</td>
                                    <td className="px-3 py-2">{d.tipoPagamento || "-"}</td>
                                    <td className="px-3 py-2">{d.dataScadenzaPagamento || ""}</td>
                                    <td className="px-3 py-2">{d.importoPagamento || ""}</td>
                                    <td className="px-3 py-2">{d.note || ""}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex items-center justify-center gap-2">
                                        <Link
                                          href={route("detailaccounting.edit", d.id)}
                                          className="text-blue-600 hover:text-blue-800"
                                          title="Modifica riga"
                                        >
                                          <PencilSquareIcon className="w-5 h-5" />
                                        </Link>
                                        {/* ⬇️ NUOVO: cestino rosso per cancellare la riga */}
                                        <button
                                          onClick={() => deleteDetail(d)}
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

                            <div className="mt-8 mb-10 h-[3px] bg-black/80 rounded"></div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
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
