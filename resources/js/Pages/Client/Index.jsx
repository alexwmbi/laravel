import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon, EyeIcon, EyeDropperIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, clients, queryParams = null, success }) {
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("client.index"), queryParams);
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
    router.get(route("client.index"), queryParams);
  };

  const deleteClient = (client) => {
    if (!window.confirm("Vuoi eliminare il cliente?")) {
      return;
    }
    router.delete(route("client.destroy", client.id));
  };

  const clientShow = (client) => {
    router.get(route("client.show", client.id), queryParams);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Clienti
          </h2>
          <Link
            href={route("client.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Cliente
          </Link>
        </div>
      }
    >
      <Head title="Clienti" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(clients,undefined, 2)}</pre>  */}
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th onClick={(e) => sortChanged("name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        NOME
                        <div>
                          <ChevronUpIcon className={"w-4 " +  (queryParams.sort_field === "name" && queryParams.sort_direction === "asc" ? "text-black" : "text-gray-500" )  } />
                          <ChevronDownIcon className={"w-4 -mt-2 " +  (queryParams.sort_field === "name" && queryParams.sort_direction === "desc" ? "text-black" : "text-gray-500" )  } />
                        </div>
                      </div>
                    </th>
                    <th className="px-3 py-2">CONTATTI</th>
                    <th className="px-3 py-2">EMAIL</th>
                    <th className="px-3 py-2">COD. FISCALE/P.IVA</th>
                    <th className="px-3 py-2">NOTE</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name}
                        placeholder="Nome Cliente"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.note}
                        placeholder="Note"
                        onBlur={(e) =>
                          searchFieldChanged("note", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("note", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.data.map((client) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={client.id}
                    >
                      <th
                        className="px-3 py-2 text-gray-950"
                        onClick={(e) => clientShow(client)}
                      >
                        <div className="text-black hover:text-indigo-600">
                          {client.name}
                        </div>
                      </th>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => clientShow(client)}
                      >
                         { client.contact && (client.contact) || client.cell && (client.cell) }  
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => clientShow(client)}
                      >
                         { client.email && (client.email) || client.email2 && (client.email2) } 
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => clientShow(client)}
                      >
                         { client.piva && (client.piva) || client.cod_fiscale && (client.cod_fiscale) } 
                    
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => clientShow(client)}
                      >
                         { client.note && (client.note) || client.note1 && (client.note1) }
                        {client.note}
                      </td>

                      <td className="px-3 py-2 text-nowrap flex">
                      <Link
                          href={route("client.clientDetail", client.id)}
                          className="font-medium text-emerald-600  mx-1"
                        >
                          
                          <EyeIcon className="max-w-5 min-w-5 text-emerald-500" />
                        </Link>
                        <Link
                          href={route("client.edit", client.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button
                          onClick={(e) => deleteClient(client)}
                          
                        >
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                          
                        </button>
                      </td>
                    </tr>
                  ))}   
                </tbody>
              </table>
              <Pagination links={clients.meta.links}/>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
