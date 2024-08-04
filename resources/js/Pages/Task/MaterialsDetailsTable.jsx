import { Link, router } from "@inertiajs/react";

export default function MaterialsDetailsTable({ materialsdetails }) {
  const deleteMaterialdetail = (material) => {
    if (!window.confirm("Vuoi rimuovere questo articolo?")) {
      return;
    }
    router.delete(route("detailmaterial.destroy", material.id));
  };

  return (
    <>
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">DESCRIZIONE</th>
              <th className="px-3 py-2">CODICE ARTICOLO</th>
              <th className="px-3 py-2">PREZZO</th>
              <th className="px-3 py-2">UM</th>
              <th className="px-3 py-2">QUANTITA</th>
              <th className="px-3 py-2">AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {materialsdetails.map((material) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                key={material.id}
              >
                <td className="px-3 py-2">{material.id}</td>
                <td className="px-3 py-2">{material.name}</td>
                <td className="px-3 py-2">{material.code}</td>
                <td className="px-3 py-2">{material.priece}</td>
                <td className="px-3 py-2">{material.um}</td>
                <td className="px-3 py-2">{material.quantity}</td>
                <td className="px-3 py-2 text-nowrap">
                  <Link
                    href={route("detailmaterial.edit", material)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={(e) => deleteMaterialdetail(material)}
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
    </>
  );
}
