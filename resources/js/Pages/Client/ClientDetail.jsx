import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";

export default function Index({
  auth,
  client,
  clientDetail,
  queryParams = null,
}) {
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
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(clients,undefined, 2)}</pre>  */}
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">NOME</th>
                    <th className="px-3 py-2">COGNOME</th>
                    <th className="px-3 py-2">CODICE FICALE</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">INDIRIZZO</th>
                    <th className="px-3 py-2">NOTE1</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                    key={clientDetail.id}
                  >
                    <th
                      className="px-3 py-2 text-gray-950"
                      onClick={(e) => clientShow(client)}
                    >
                      <div className="text-black hover:text-indigo-600">
                        {clientDetail.name}
                      </div>
                    </th>

                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.surname}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.cod_fiscale}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address1}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address2}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address3}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address4}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address5}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.address6}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note1}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg my-5">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">TELEFONO</th>
                    <th className="px-3 py-2">CELLULARE</th>
                    <th className="px-3 py-2">FAX</th>
                    <th className="px-3 py-2">EMAIL1</th>
                    <th className="px-3 py-2">EMAIL2</th>
                    <th className="px-3 py-2">NOTE2</th>
                    <th className="px-3 py-2">SEX</th>
                    <th className="px-3 py-2">NOTE3</th>
                    <th className="px-3 py-2">NOTE4</th>
                    <th className="px-3 py-2">PERCENTUALE</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                    key={clientDetail.id}
                  >
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.tel}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.contact}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.cell}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.email}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.email2}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note2}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.sex}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note3}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note4}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.percentage}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg my-5">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">ALIQUOTA</th>
                    <th className="px-3 py-2">BONIFICO</th>
                    <th className="px-3 py-2">GIORNI</th>
                    <th className="px-3 py-2">NOTE5</th>
                    <th className="px-3 py-2">NOTE6</th>
                    <th className="px-3 py-2">NOTE7</th>
                    <th className="px-3 py-2">NOTE8</th>
                    <th className="px-3 py-2">NOTE9</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                    key={clientDetail.id}
                  >
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.aliquota}
                    </td>

                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.bonifico}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.giorni}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note5}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note6}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note7}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note8}
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => clientShow(client)}
                    >
                      {clientDetail.note9}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
