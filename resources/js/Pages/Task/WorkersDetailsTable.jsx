import { Link, router } from "@inertiajs/react";
export default function WorkersDetailsTable({ workers }) {
  const deleteWorkdetail = (worker) => {
    if (!window.confirm("Vuoi rimuovere questo operaio?")) {
      return;
    }
    router.delete(route("detailwork.destroy", worker.id));
  };

  return (
    <>
      {/* <pre>{JSON.stringify(workers,undefined, 2)}</pre>  */}
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">NOME</th>
              <th className="px-3 py-2">CODICE</th>
              <th className="px-3 py-2">ORE</th>
              <th className="px-3 py-2">NOTE</th>
              <th className="px-3 py-2">AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                key={worker.id}
              >
                <td className="px-3 py-2">{worker.id}</td>
                <th className="px-3 py-2 text-white ">
                  <p className="text-black hover:text-indigo-600">
                    <Link href={route("worker.show", worker.worker_id)}>
                      {worker.name}
                    </Link>
                  </p>
                </th>
                <td className="px-3 py-2">{worker.code}</td>
                <td className="px-3 py-2">{worker.hours}</td>
                <td className="px-3 py-2">{worker.note}</td>
                <td className="px-3 py-2 text-nowrap">
                  <Link
                    href={route("detailwork.edit", worker)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={(e) => deleteWorkdetail(worker)}
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
