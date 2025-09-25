import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, router } from "@inertiajs/react";
import InputLabel from "@/Components/CurrentDate";
import { useState, useEffect } from "react";
import WorkTasksTable from "../Work/WorkTasksTable";
import CurrentDate from "@/Components/CurrentDate";

// ELENCO TASK ORE E PREZZI
// ELENCO MATERIALI CON PREZZI
// PREZZO TOTALE LAVORO
// ALLEGATI

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

  const [selectedItemsTask, setSelectedItemsTask] = useState([]);

  function checkboxHandlerTask(e) {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value);

    if (isSelected) {
      setSelectedItemsTask([...selectedItemsTask, value]);
    } else {
      setSelectedItemsTask((prevData) => {
        return prevData.filter((id) => {
          return id !== value;
        });
      });
    }
  }

  const [selectedItemsMaterials, setSelectedItemsMaterials] = useState([]);

  function checkboxHandlerMaterials(e) {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value);

    if (isSelected) {
      setSelectedItemsMaterials([...selectedItemsMaterials, value]);
    } else {
      setSelectedItemsMaterials((prevData) => {
        return prevData.filter((id) => {
          return id !== value;
        });
      });
    }
  }

  const popolateQury = () => {
    queryParams["selectedItemsMaterials"] = selectedItemsMaterials;
    queryParams["selectedItemsTask"] = selectedItemsTask;
    router.get(route("work.invoicePrint", work), queryParams);
  };

  function checkAllHandlerTask() {
    if (tasks.data.length === selectedItemsTask.length) {
      setSelectedItemsTask([]);
    } else {
      const taskIds = tasks.data.map((item) => {
        return item.id;
      });

      setSelectedItemsTask(taskIds);
    }
  }

  function checkAllHandlerMaterials() {
    if (detailmaterial.data.length === selectedItemsMaterials.length) {
      setSelectedItemsMaterials([]);
    } else {
      const materialIds = detailmaterial.data.map((item) => {
        return item.id;
      });

      setSelectedItemsMaterials(materialIds);
    }
  }

  useEffect(() => {
    let ignore = false;

    if (!ignore) checkAllHandlerTask();checkAllHandlerMaterials();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
            {`Fattura`}
          </h2>
        </div>
      }
    >
      {/* <pre>{JSON.stringify(clientData, undefined, 1)}</pre> */}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
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

                        {/* <th className="px-3 py-2">TOTALE MATERIALI</th> */}
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
                          {/* <td className="px-3 py-2">{task.materials}</td> */}
                          {/* <td className="px-3 py-2">{materialsTot}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                        {/* <th className="px-3 py-2">ID</th> */}
                        <th className="px-3 py-2">DESCRIZIONE</th>
                        <th className="px-3 py-2">CODICE ARTICOLO</th>
                        <th className="px-3 py-2">PREZZO</th>
                        <th className="px-3 py-2">QUANTITA</th>
                        <th className="px-3 py-2">UM</th>
                        <th className="px-3 py-2">TOTALE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailmaterial.data.map((material) => (
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
                          {/* <td className="px-3 py-2">{material.id}</td> */}
                          <td className="px-3 py-2">{material.name}</td>
                          <td className="px-3 py-2">{material.code}</td>
                          <td className="px-3 py-2">
                            {/* {material.priece} */}
                          {(material.priece * material.default_aug / 100) + (material.priece * material.custom_aug / 100) +  parseFloat (material.priece )  }
                          </td>
                          <td className="px-3 py-2">{material.quantity}</td>
                          <td className="px-3 py-2">{material.um}</td>
                          <td className="px-3 py-2">
                            {/* {material.priece * material.quantity} */}
                            {( parseFloat (material.priece * material.default_aug / 100) + parseFloat (material.priece * material.custom_aug / 100) +  parseFloat (material.priece ) ) * parseFloat (material.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={(e) => popolateQury()}
                  // href={route("work.invoice", work)}
                  className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  <div>IDS: task
      {selectedItemsTask.toString()}
      </div>
      <div>IDS: materials
      {selectedItemsMaterials.toString()}
      </div> */}
    </AuthenticatedLayout>
  );
}
