import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ auth, workers, queryParams = null, success }) {
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
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
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
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">NOME</th>
                    <th className="px-3 py-2">CODICE</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2"></th>
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
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {workers.data.map((worker) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                      key={worker.id}
                    >
                      <td className="px-3 py-2">{worker.id}</td>
                      <td className="px-3 py-2">{worker.name}</td>
                      <td className="px-3 py-2">{worker.code}</td>
                      <td className="px-3 py-2 text-nowrap">
                        <Link  href={route("worker.edit", worker.id)} 
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1" >
                          Modifica
                        </Link>
                        <button
                            onClick={(e) => deleteWorker(worker)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline mx-1"
                          >
                            Elimina
                          </button>
                          <Link  href={route("worker.edit", worker.id)} 
                        className="font-medium text-green-600 dark:text-green-500 hover:underline mx-1" >
                          Crea Task
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
