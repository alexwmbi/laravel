import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon, EyeIcon, EyeDropperIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";
import SelectInput from "@/Components/SelectInput";

export default function Index({ auth, calls, queryParams = null, success }) {
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("call.index"), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    if (name === queryParams.sort_field) {
      if (queryParams.sort_direction === "asc") {
        queryParams.sort_direction = "desc";
      } else {
        queryParams.sort_direction = "asc";
      }
    } else {
      queryParams.sort_field = "name";
      queryParams.sort_direction = "asc";
    }
    router.get(route("call.index"), queryParams);
  };

  const deleteCall = (call) => {
    if (!window.confirm("Vuoi eliminare il la chiamata?")) {
      return;
    }
    router.delete(route("call.destroy", call.id));
  };

  const callShow = (call) => {
    router.get(route("call.show", call.id), queryParams);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Chiamate
          </h2>
          <Link
            href={route("call.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuova Chiamata
          </Link>
        </div>
      }
    >
      <Head title="Chiamata" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(calls,undefined, 2)}</pre>  */}
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                   {/*  <th onClick={(e) => sortChanged("name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        NOME
                        <div>
                          <ChevronUpIcon className={"w-4 " +  (queryParams.sort_field === "name" && queryParams.sort_direction === "asc" ? "text-black" : "text-gray-500" )  } />
                          <ChevronDownIcon className={"w-4 -mt-2 " +  (queryParams.sort_field === "name" && queryParams.sort_direction === "desc" ? "text-black" : "text-gray-500" )  } />
                        </div>
                      </div>
                    </th> */}
                    <th className="px-3 py-2">OGGETTO</th>
                    {/* <th className="px-3 py-2">STATO</th> */}
                    <th className="px-3 py-2">URGENZA</th>
                    <th className="px-3 py-2">TIPOLOGIA</th>
                    <th className="px-3 py-2">CLIENTE</th>
                    <th className="px-3 py-2">LAVORO</th>
                    {/* <th className="px-3 py-2">DATA</th> */}
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.oggetto}
                        placeholder="Oggetto"
                        onBlur={(e) =>
                          searchFieldChanged("oggetto", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("oggetto", e)}
                      />
                    </th>
                    <th className="px-3 py-2 ">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.urgenza}
                        onChange={(e) =>
                          searchFieldChanged("urgenza", e.target.value)
                        }
                      >
                        <option value="">Seleziona Stato</option>
                        <option value="urgente">Urgente</option>
                        <option value="nonurgente">Non urgente</option>
                      </SelectInput>
                    </th>
                    <th className="px-3 py-2 ">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.tipologia}
                        onChange={(e) =>
                          searchFieldChanged("tipologia", e.target.value)
                        }
                      >
                        <option value="">Seleziona Tipo</option>
                        <option value="economia">In Economia</option>
                        <option value="preventivo">Con Preventivo</option>
                      </SelectInput>
                    </th>
                    <th>
                    <TextInput
                        className="w-full"
                        defaultValue={queryParams.cliente}
                        placeholder="Cliente"
                        onBlur={(e) =>
                          searchFieldChanged("cliente", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("cliente", e)}
                      />
                    </th>
                    <th>
                    <TextInput
                        className="w-full"
                        defaultValue={queryParams.lavoro}
                        placeholder="Lavoro"
                        onBlur={(e) =>
                          searchFieldChanged("lavoro", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("lavoro", e)}
                      />
                    </th>
                  {/*   <th>
                    <TextInput
                        className="w-full"
                        defaultValue={queryParams.data}
                        placeholder="Data"
                        onBlur={(e) =>
                          searchFieldChanged("data", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("data", e)}
                      />
                    </th> */}
                   
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {calls.data.map((call) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={call.id}
                    >
                      <th
                        className="px-3 py-2 text-gray-950"
                        onClick={(e) => callShow(call)}
                      >
                        <div className="text-black hover:text-indigo-600">
                          {call.oggetto}
                        </div>
                      </th>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => callShow(call)}
                      >
                         { call.urgenza }  
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => callShow(call)}
                      >
                         { call.tipo }  
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => callShow(call)}
                      >
                         { call.cliente }  
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => callShow(call)}
                      >
                         { call.work_name }  
                      </td>
                      {/* <td
                        className="px-3 py-2"
                        onClick={(e) => callShow(call)}
                      >
                         { call.data }  
                      </td>
                      */}

                      <td className="px-3 py-2 text-nowrap flex">
                      
                        <Link
                          href={route("call.edit", call.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button
                          onClick={(e) => deleteCall(call)}
                          
                        >
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                          
                        </button>
                      </td>
                    </tr>
                  ))}   
                </tbody>
              </table>
              <Pagination links={calls.meta.links}/>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
