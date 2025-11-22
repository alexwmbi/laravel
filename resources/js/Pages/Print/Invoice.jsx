import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Invoice({
  auth,
  detailmaterial,
  detailwork,
  work,
  tasks,
  queryParams = null,
  success,
  print,
  client,
  client_id,
  hoursTot,
  materialsTot,
  clientData,
  materialTaskDistinct,
}) {
  queryParams = queryParams || {};

  // ================== TIPO DOCUMENTO ==================
  const [invoiceType, setInvoiceType] = useState("TD01");

  const INVOICE_TYPES = [
    { value: "TD01", label: "Fattura (TD01)" },
    { value: "TD02", label: "Acconto / anticipo su fattura (TD02)" },
    { value: "TD04", label: "Nota di credito (TD04)" },
  ];

  // ================== SELEZIONE TASK ==================
  const [selectedItemsTask, setSelectedItemsTask] = useState([]);

  function checkboxHandlerTask(e) {
    const isSelected = e.target.checked;
    const value = parseInt(e.target.value, 10);

    if (isSelected) {
      setSelectedItemsTask((prev) => [...prev, value]);
    } else {
      setSelectedItemsTask((prevData) => prevData.filter((id) => id !== value));
    }
  }

  // ================== SELEZIONE MATERIALI ==================
  const [selectedItemsMaterials, setSelectedItemsMaterials] = useState([]);

  function checkboxHandlerMaterials(e) {
    const isSelected = e.target.checked;
    const value = parseInt(e.target.value, 10);

    if (isSelected) {
      setSelectedItemsMaterials((prev) => [...prev, value]);
    } else {
      setSelectedItemsMaterials((prevData) =>
        prevData.filter((id) => id !== value)
      );
    }
  }

  // ================== POPOLA QUERY E INVIA (SOLO ANTEPRIMA) ==================
  const popolateQury = () => {
    const params = {
      ...queryParams,
      selectedItemsMaterials,
      selectedItemsTask,
      tipo_documento: invoiceType, // passa il tipo documento al backend
    };

    // SOLO anteprima fattura → nessun XML, nessun salvataggio
    router.get(route("work.invoicePrint", work), params);
  };

  // ================== CHECK / UNCHECK TUTTO ==================
  function checkAllHandlerTask() {
    if (tasks.data.length === selectedItemsTask.length) {
      setSelectedItemsTask([]);
    } else {
      const taskIds = tasks.data.map((item) => item.id);
      setSelectedItemsTask(taskIds);
    }
  }

  function checkAllHandlerMaterials() {
    if (detailmaterial.data.length === selectedItemsMaterials.length) {
      setSelectedItemsMaterials([]);
    } else {
      const materialIds = detailmaterial.data.map((item) => item.id);
      setSelectedItemsMaterials(materialIds);
    }
  }

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      checkAllHandlerTask();
      checkAllHandlerMaterials();
    }
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
            Fattura
          </h2>
        </div>
      }
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* ================== BARRA SCELTA TIPO DOCUMENTO ================== */}
              <div className="flex flex-wrap items-end justify-between mb-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo documento FatturaPA
                  </label>
                  <select
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900"
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                  >
                    {INVOICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {client && (
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <div className="font-semibold">
                      {client.name || clientData?.name}
                    </div>
                    {client.cod_fiscale && (
                      <div>CF: {client.cod_fiscale}</div>
                    )}
                    {client.piva && <div>P.IVA: {client.piva}</div>}
                  </div>
                )}
              </div>

              {/* ================== LAVORAZIONI ================== */}
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <p className="mb-2">LAVORAZIONI</p>
                  <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase">
                      <tr className="text-nowrap bg-gray-100">
                        <th className="px-3 py-2 ">
                          <div className="flex">
                            <div>
                              <label>
                                <input
                                  type="checkbox"
                                  defaultChecked={true}
                                  onChange={checkAllHandlerTask}
                                />
                              </label>
                            </div>
                            <div className="px-3">SELEZIONA</div>
                          </div>
                        </th>

                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">NOME</th>
                        <th className="px-3 py-2">DESCRIZIONE</th>
                        <th className="px-3 py-2">ORE</th>
                        <th className="px-3 py-2">COSTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.data.map((task) => (
                        <tr
                          className="bg-white border-b dark:bg-gray-700 dark:border-gray-700  hover:bg-purple-100"
                          key={task.id}
                        >
                          <td className="px-3 py-2">
                            <label>
                              <input
                                type="checkbox"
                                checked={selectedItemsTask.includes(task.id)}
                                value={task.id}
                                onChange={checkboxHandlerTask}
                              />
                            </label>
                          </td>
                          <td className="px-3 py-2">{task.id}</td>
                          <td className="px-3 py-2">{task.name}</td>
                          <td className="px-3 py-2">{task.description}</td>
                          <td className="px-3 py-2">{task.hours}</td>
                          <td className="px-3 py-2">{task.hourspriece}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================== MATERIALI ================== */}
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 m-7">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <p className="mb-2">MATERIALI</p>
                  <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase">
                      <tr className="text-nowrap bg-gray-100">
                        <th className="px-3 py-2">
                          <div className="flex">
                            <div>
                              <label>
                                <input
                                  type="checkbox"
                                  defaultChecked={true}
                                  onChange={checkAllHandlerMaterials}
                                />
                              </label>
                            </div>
                            <div className="px-3">SELEZIONA</div>
                          </div>
                        </th>

                        <th className="px-3 py-2">LAVORAZIONE ID</th>
                        <th className="px-3 py-2">DESCRIZIONE</th>
                        <th className="px-3 py-2">CODICE ARTICOLO</th>
                        <th className="px-3 py-2">PREZZO</th>
                        <th className="px-3 py-2">QUANTITA</th>
                        <th className="px-3 py-2">UM</th>
                        <th className="px-3 py-2">TOTALE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailmaterial.data.map((material) => {
                        const prezzoUnitario =
                          (material.priece * material.default_aug) / 100 +
                          (material.priece * material.custom_aug) / 100 +
                          parseFloat(material.priece);

                        const totaleRiga =
                          prezzoUnitario * parseFloat(material.quantity);

                        return (
                          <tr
                            className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                            key={material.id}
                          >
                            <td className="px-3 py-2">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={selectedItemsMaterials.includes(
                                    material.id
                                  )}
                                  value={material.id}
                                  onChange={checkboxHandlerMaterials}
                                />
                              </label>
                            </td>
                            <td className="px-3 py-2">{material.task}</td>
                            <td className="px-3 py-2">{material.name}</td>
                            <td className="px-3 py-2">{material.code}</td>
                            <td className="px-3 py-2">{prezzoUnitario}</td>
                            <td className="px-3 py-2">{material.quantity}</td>
                            <td className="px-3 py-2">{material.um}</td>
                            <td className="px-3 py-2">{totaleRiga}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================== BOTTONE OK ================== */}
              <div className="mt-4 text-right">
                <button
                  onClick={popolateQury}
                  className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
