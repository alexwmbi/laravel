import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, materials, taskid, filters = {} }) {
  const [selectedItems, setSelectedItems] = useState([]);

  // ---- FILTRI ---------------------------------------------------------------
  const [search, setSearch] = useState({
    codice_articolo: filters.codice_articolo ?? "",
    codice_prodotto: filters.codice_prodotto ?? "",
    descrizione: filters.descrizione ?? "",
  });

  // Mantieni tutti i parametri già presenti nella query string (due_date, hours, ecc.)
  const baseQuery = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return obj;
  }, []);

  // Debounce: invia la GET 400ms dopo l'ultimo input
  useEffect(() => {
    const t = setTimeout(() => {
      router.get(
        route("detailmaterial.index"), // usa il nome della tua route
        {
          ...baseQuery,   // conserva gli altri parametri in URL
          ...search,      // applica i filtri
          id: taskid,     // sicurezza: mantieni sempre l'id del task
        },
        { preserveState: true, replace: true }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ---- FORM INVIO RIGHE SELEZIONATE ----------------------------------------
  function strcreate(selectedItems) {
    return selectedItems;
  }
  const { data, setData, post } = useForm(strcreate());

  function checkboxHandler(e) {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value);

    if (isSelected) {
      setSelectedItems([...selectedItems, value]);
    } else {
      setSelectedItems((prevData) => prevData.filter((id) => id !== value));
    }
  }

  const onSubmit = (e) => {
    e.preventDefault();
    post(route("detailmaterial.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Aggiungi Articolo
          </h2>
        </div>
      }
    >
      <Head title="Aggiungi Articolo" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">

              {/* FILTRI DI RICERCA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Filtra per CODICE ARTICOLO"
                  className="border rounded px-3 py-2 w-full dark:bg-gray-700 dark:border-gray-600"
                  value={search.codice_articolo}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, codice_articolo: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Filtra per CODICE PRODOTTO"
                  className="border rounded px-3 py-2 w-full dark:bg-gray-700 dark:border-gray-600"
                  value={search.codice_prodotto}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, codice_prodotto: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Filtra per DESCRIZIONE"
                  className="border rounded px-3 py-2 w-full dark:bg-gray-700 dark:border-gray-600"
                  value={search.descrizione}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, descrizione: e.target.value }))
                  }
                />
              </div>

              <form
                onSubmit={onSubmit}
                className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
              >
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap">
                      <th className="px-3 py-2">CODICE ARTICOLO</th>
                      <th className="px-3 py-2">CODICE PRODOTTO</th>
                      <th className="px-3 py-2">DESCRIZIONE</th>
                      <th className="px-3 py-2">PREZZO</th>
                      <th className="px-3 py-2">UM</th>
                      <th className="px-3 py-2">RINCARICO STANDARD</th>
                      <th className="px-3 py-2">RINCARICO PERSONALIZZATO</th>
                      <th className="px-3 py-2">QUANTITA</th>
                      <th className="px-3 py-2">MAGAZZINO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <pre>{JSON.stringify(materials, undefined, 1)}</pre> */}
                    {materials.data.map((material, index) => (
                      <tr key={index}>
                        <td>
                          <h1>{material.cod_art}</h1>
                        </td>
                        <td>
                          <h1>{material.cod_prod}</h1>
                        </td>
                        <td>
                          <h1>{material.desc}</h1>
                        </td>
                        <td>
                          <h1>{material.priece}</h1>
                        </td>
                        <td>
                          <h1>{material.um}</h1>
                        </td>
                        <td>
                          <TextInput
                            id={"default_aug" + material.id}
                            type="text"
                            name={"default_aug" + material.id}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) =>
                              setData("default_aug" + material.id, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <TextInput
                            id={"custom_aug" + material.id}
                            type="text"
                            name={"custom_aug" + material.id}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) =>
                              setData("custom_aug" + material.id, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <TextInput
                            id={"hours" + material.id}
                            type="text"
                            name={"hours" + material.id}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) =>
                              setData("quantity" + material.id, e.target.value)
                            }
                          />
                        </td>
                        <td className="px-27 ">
                          <h1>/{material.quantity}</h1>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination links={materials.meta.links} />

                <div className="mt-4 text-right">
                  <Link
                    href={route("task.show", taskid)}
                    className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                  >
                    Annulla
                  </Link>
                  <button className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                    OK
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
