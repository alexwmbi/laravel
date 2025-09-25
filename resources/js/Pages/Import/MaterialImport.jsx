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

export default function Import({
  auth,
  materials,
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

    router.get(route("material.index"), queryParams);
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
      queryParams.sort_field = name;
      queryParams.sort_direction = "asc";
    }
    router.get(route("material.index"), queryParams);
  };

  const deletematerial = (material) => {
    if (!window.confirm("Vuoi eliminare il materiale?")) {
      return;
    }
    router.delete(route("material.destroy", material.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Catalogo
          </h2>

          <div className="flex flex-row space-x-4 ">
          <Link
              href={route("material.import")}
              className="bg-amber-200 py-1 px-4 text-amber-500 rounded shadow transition-all hover:bg-amber-400 hover:text-white"
            >
              Importa Catalogo
            </Link>
          <Link
            href={route("material.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Materiale
          </Link>
          </div>
        </div>
      }
    >
      <Head title="Catalogo" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(materials,undefined, 2)}</pre>  */}
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    {/* <th className="px-3 py-2">ID</th> */}
                    <th onClick={(e) => sortChanged("cod_art")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        CODICE ARTICOLO
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "cod_art" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "cod_art" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("cod_prod")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        CODICE PRODOTTO
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "cod_prod" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "cod_prod" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("name_prod")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        NOME PRODOTTO
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "name_prod" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "name_prod" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("desc")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        DESCRIZIONE
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "desc" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "desc" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("quantity")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        QUANTITA
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "quantity" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "quantity" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("um")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        UM
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "um" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "um" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("priece")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        PREZZO
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "priece" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "priece" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th onClick={(e) => sortChanged("iva")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        IVA
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "iva" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "iva" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.cod_art}
                        placeholder="Codice articolo"
                        onBlur={(e) =>
                          searchFieldChanged("cod_art", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("cod_art", e)}
                      />
                    </th>

                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.cod_prod}
                        placeholder="Codice prodotto"
                        onBlur={(e) =>
                          searchFieldChanged("cod_prod", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("cod_prod", e)}
                      />
                    </th>

                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name_prod}
                        placeholder="Nome prodotto"
                        onBlur={(e) =>
                          searchFieldChanged("name_prod", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name_prod", e)}
                      />
                    </th>

                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.desc}
                        placeholder="Descrizione"
                        onBlur={(e) =>
                          searchFieldChanged("desc", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("desc", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.data.map((material) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={material.id}
                    >
                      {/* <td className="px-3 py-2">{material.id}</td> */}
                      <td className="px-3 py-2">{material.cod_art}</td>
                      <td className="px-3 py-2">{material.cod_prod}</td>
                      <td className="px-3 py-2">{material.name_prod}</td>
                      <td className="px-3 py-2">{material.desc}</td>
                      <td className="px-3 py-2">{material.quantity}</td>
                      <td className="px-3 py-2">{material.um}</td>
                      <td className="px-3 py-2">{material.priece}</td>
                      <td className="px-3 py-2">{material.iva}</td>

                      <td className="px-3 py-2 text-nowrap flex">
                     

                        <Link
                        href={route("material.edit", material.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button
                          onClick={(e) => deletematerial(material)}
                          
                        >
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                          
                        </button>


                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination links={materials.meta.links}/>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
