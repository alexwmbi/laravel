import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import WorkerTasksTable from "./WorkerTasksTable";

import { Head, Link, router } from "@inertiajs/react";

export default function Show({ auth, worker, taskworker, queryParams = null }) {
  const n = 1;
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("worker.show", worker.id), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          {/* <pre>{JSON.stringify(worker,undefined, 2)}</pre>  */}
            {`Tasks operaio ${worker.name}`}
          </h2>
          <Link
            href={route("work.create")}
             className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Lavoro
          </Link>
        </div>
      }
    >
      <Head title={`Lavori ${worker.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-1 text-gray-900 dark:text-gray-100"></div>
            <dir className="overflow-auto">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400" >
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">NOME</th>
                    <th className="px-3 py-2">CATEGORIA</th>
                    <th className="px-3 py-2">LAVORO</th>
                    <th className="px-3 py-2">ORE</th>
                    <th className="px-3 py-2">DESCRIZIONE</th>
                    <th className="px-3 py-2">NOTE</th>
                    <th className="px-3 py-2">DATA INIZIO</th>
                    <th className="px-3 py-2">DATA CONSEGNA</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">  
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name}
                        placeholder="Nome Lavoro"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2">
                      {/* <SelectInput
                        className="w-full"
                        defaultValue={queryParams.status}
                        onChange={(e) =>
                          searchFieldChanged("status", e.target.value)
                        }
                      >
                        <option value="">Seleziona Stato</option>
                        <option value="active">Attivo</option>
                        <option value="archived">Archiviato</option>
                      </SelectInput> */}
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <WorkerTasksTable taskworker={taskworker} />
                </tbody>
              </table>
            </dir>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
