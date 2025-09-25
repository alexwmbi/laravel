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
  suppliers,
  queryParams = null,
  success,
}) {
  queryParams = queryParams || {};
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("supplier.index"), queryParams);
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
    router.get(route("supplier.index"), queryParams);
  };

  const deleteSupplier = (supplier) => {
    if (!window.confirm("Vuoi eliminare il fornitore?")) {
      return;
    }
    router.delete(route("supplier.destroy", supplier.id));
  };

  const supplierShow = (supplier) => {
    router.get(route("supplier.show", supplier.id), queryParams);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Fornitori
          </h2>
          <Link
            href={route("supplier.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Fornitore
          </Link>
        </div>
      }
    >
      <Head title="Supplieri" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(suppliers,undefined, 2)}</pre>  */}
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th onClick={(e) => sortChanged("name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        NOME
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "name" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "name" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-3 py-2">CONTATTI</th>
                    <th className="px-3 py-2">EMAIL</th>
                    <th className="px-3 py-2">PIVA</th>
                    <th className="px-3 py-2">CODICE</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.ragsoccf}
                        placeholder="Nome Fornitore"
                        onBlur={(e) =>
                          searchFieldChanged("ragsoccf", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("ragsoccf", e)}
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
                  {suppliers.data.map((supplier) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={supplier.id}
                    >
                      <th
                        className="px-3 py-2 text-gray-950"
                        onClick={(e) => supplierShow(supplier)}
                      >
                        <div className="text-black hover:text-indigo-600">
                          {supplier.ragsoccf}
                        </div>
                      </th>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => supplierShow(supplier)}
                      >
                        {supplier.telef}
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => supplierShow(supplier)}
                      >
                        {supplier.indemailf}
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => supplierShow(supplier)}
                      >
                        {supplier.pivacf}
                      </td>
                      <td
                        className="px-3 py-2"
                        onClick={(e) => supplierShow(supplier)}
                      >
                        {supplier.codcon}
                      </td>

                      <td className="px-3 py-2 text-nowrap flex">
                        <Link
                          href={route("supplier.edit", supplier.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button onClick={(e) => deleteSupplier(supplier)}>
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination links={suppliers.meta.links} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
