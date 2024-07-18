import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import {
  WORK_STATUS_CLASS_MAP,
  WORK_STATUS_TEXT_MAP,
} from "@/constants.jsx";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ auth, client, works, queryParams = null }) {
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("client.show", client.id), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const deleteWork = (work) => {
    if (!window.confirm("Vuoi eliminare questo lavoro?")) {
      return;
    }
    router.delete(route("work.destroy", work.id));
  };


  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {`Lavori "${client.name}"`}
          </h2>
          <Link
        href={route("work.create")}
        className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
      >
        Nuovo Lavoro
      </Link>
        </div>
      }
    >
      <Head title={`Lavori ${client.name}`} />

      {/* <pre>{JSON.stringify(queryParams, undefined, 1)}</pre>  */}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-1 text-gray-900 dark:text-gray-100"></div>
            <dir className="overflow-auto">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">NAME</th>
                    <th className="px-3 py-2">STATUS</th>
                    <th className="px-3 py-2">DATA INIZIO</th>
                    <th className="px-3 py-2">DATA CONSEGNA</th>
                    <th className="px-3 py-2">DESCRIZIONE</th>
                    <th className="px-3 py-2">MODIFICA</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2"></th>
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
                    <th className="px-3 py-2">
                    
                      <SelectInput
                          className="w-full"
                          defaultValue={queryParams.status}
                          onChange={(e) =>
                            searchFieldChanged("status", e.target.value)
                          }
                        >
                          <option value="">Seleziona Stato</option>
                          <option value="active">Attivo</option>
                          <option value="archived">Archiviato</option>
                        </SelectInput>
                        
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((work) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                      key={work.id}
                    >
                      <td className="px-3 py-2">{work.id}</td>
                      <th className="px-3 py-2 text-white hover:underline">
                        <Link href={route("work.show", work.id)}>
                          {work.name}
                        </Link>
                      </th>
                      <td className="px-3 py-2">
                      <span
                            className={
                              "px-2 py-1 rounded text-white " +
                              WORK_STATUS_CLASS_MAP[work.status]
                            }
                          >
                            {WORK_STATUS_TEXT_MAP[work.status]}
                          </span>
                        </td>
                      <td className="px-3 py-2">{work.starting_date}</td>
                      <td className="px-3 py-2">{work.due_date}</td>
                      <td className="px-3 py-2">{work.note}</td>
                      <td className="px-3 py-2 text-nowrap">
                        <Link href={route("work.edit", work)}
                         className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1" >
                          Modifica
                        </Link>
                        <button
                            onClick={(e) => deleteWork(work)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline mx-1"
                          >
                            Elimina
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </dir>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
