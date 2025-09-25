import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import SelectInput from "@/Components/SelectInput";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  DocumentPlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

export default function Index({
  auth,
  workers,
  queryParams = null,
  workerTask,
  success,
}) {
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("worker.index"), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const deleteWorker = (worker) => {
    if (!window.confirm("Vuoi eliminare l'operaio?")) {
      return;
    }
    router.delete(route("worker.destroy", worker.id));
  };

  const checkStatus = (workerTask, worker) => {
    let status = 0;
    workerTask.map((workerT) => workerT.worker_id == worker.id && status++);
    return status;
  };

  const workerShow = (worker) => {
    router.get(route("worker.show", worker.id), queryParams);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Operai
          </h2>
          <Link
            href={route("worker.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Inserisci Operaio
          </Link>
        </div>
      }
    >
      <Head title="Operai" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">NOME</th>
                    <th className="px-3 py-2">CODICE</th>
                    <th className="px-3 py-2">STATO</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name}
                        placeholder="Nome Operaio"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.code}
                        placeholder="Codice"
                        onBlur={(e) =>
                          searchFieldChanged("code", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("code", e)}
                      />
                    </th>
                    <th className="px-3 py-2 ">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.status}
                        onChange={(e) =>
                          searchFieldChanged("status", e.target.value)
                        }
                      >
                        <option value="">Seleziona Stato</option>
                        <option value="applied">Lavori Attivi</option>
                        <option value="free">Libero</option>
                      </SelectInput>
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {workers.data.map((worker) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={worker.id}
                    >
                      <th className="px-3 py-2 text-gray-950">
                        <div className="text-black hover:text-indigo-600">
                          <Link href={route("worker.show", worker.id)}>
                            {worker.name}
                          </Link>
                        </div>
                      </th>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => workerShow(worker)}
                      >
                        {worker.code}
                      </td>

                      {/* <pre>{JSON.stringify(workerTask,undefined, 2)}</pre> */}
                      {/* <td className="px-3 py-2">{ workerTask.map((workerT) => ( workerT.worker_id == worker.id && workerT.task ))}</td> */}
                      <td
                        className="px-3 py-2"
                        onClick={(e) => workerShow(worker)}
                      >
                        {(checkStatus(workerTask, worker) > 0 && (
                          <span
                            className={
                              "m-1 px-2 py-1 rounded text-white bg-amber-300 "
                            }
                          >
                            Lavori Attivi
                          </span>
                        )) || (
                          <span
                            className={
                              "m-1 px-2 py-1 rounded text-white bg-emerald-300 "
                            }
                          >
                            Libero
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-nowrap flex">
                        <Link
                          href={route("worker.edit", worker.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button onClick={(e) => deleteWorker(worker)}>
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                        </button>
                        <Link
                          href={route("worker.clientfromworker", worker.id)}
                          className="font-medium text-green-600 dark:text-green-500"
                        >
                          <DocumentPlusIcon className="max-w-5 min-w-5 ml-1 text-emerald-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
