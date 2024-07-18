import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

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

  const deleteClient = (client) => {
    if (!window.confirm("Vuoi eliminare il cliente?")) {
      return;
    }
    router.delete(route("client.destroy", client.id));
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
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
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
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">NAME</th>
                    <th className="px-3 py-2">CONTATTI</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">PIVA</th>
                    <th className="px-3 py-2">NOTE</th>
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
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.data.map((client) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                      key={client.id}
                    >
                      <td className="px-3 py-2">{client.id}</td>
                      <th className="px-3 py-2 text-white hover:underline">
                        <Link href={route("client.show", client.id)}>
                          {client.name}
                        </Link>
                      </th>
                      <td className="px-3 py-2">{client.contact}</td>
                      <td className="px-3 py-2">{client.address}</td>
                      <td className="px-3 py-2">{client.piva}</td>
                      <td className="px-3 py-2">{client.note}</td>
                      <td className="px-3 py-2 text-nowrap">
                        <Link  href={route("client.edit", client.id)} 
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1" >
                          Modifica
                        </Link>
                        <button
                            onClick={(e) => deleteClient(client)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline mx-1"
                          >
                            Elimina
                          </button>
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
