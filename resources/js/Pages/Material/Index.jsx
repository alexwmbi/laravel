import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
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
          <Link
            href={route("material.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Materiale
          </Link>
        </div>
      }
    >
      <Head title="Catelogo" />
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
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">CODICE ARTICOLO</th>
                    <th className="px-3 py-2">CODICE PRODOTTO</th>
                    <th className="px-3 py-2">NOME PRODOTTO</th>
                    <th className="px-3 py-2">DESCRIZIONE</th>
                    <th className="px-3 py-2">UM</th>
                    <th className="px-3 py-2">PREZZO</th>
                    <th className="px-3 py-2">IVA</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2"></th>
                    {/* <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.name}
                        placeholder="Nome materiale"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th> */}
                    <th className="px-3 py-2"></th>
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
                      <td className="px-3 py-2">{material.id}</td>
                      <td className="px-3 py-2">{material.cod_art}</td>
                      <td className="px-3 py-2">{material.cod_prod}</td>
                      <td className="px-3 py-2">{material.name_prod}</td>
                      <td className="px-3 py-2">{material.desc}</td>
                      <td className="px-3 py-2">{material.um}</td>
                      <td className="px-3 py-2">{material.priece}</td>
                      <td className="px-3 py-2">{material.iva}</td>

                      <td className="px-3 py-2 text-nowrap">
                         <Link  href={route("material.edit", material.id)} 
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1" >
                          Modifica
                        </Link>
                        <button
                          onClick={(e) => deletematerial(material)}
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
