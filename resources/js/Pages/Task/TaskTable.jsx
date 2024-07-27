import { Link } from "@inertiajs/react";

export default function TaskTable({ task, hoursTot , materialsTot}) {
  return (
    <>  
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2">NOME TASK</th>
              <th className="px-3 py-2">TOTALE ORE</th>
              <th className="px-3 py-2">TOTALE MATERIALI</th>
              <th className="px-3 py-2">DESCRIZIONE</th>
              <th className="px-3 py-2">AZIONI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
              key={task.id}
            >
              <td className="px-3 py-2">{task.name}</td>
              <td className="px-3 py-2">{hoursTot}</td>
              <td className="px-3 py-2">{materialsTot}</td>

              <td className="px-3 py-2">{task.workers}</td>

              <td className="px-3 py-2 text-nowrap">
                <Link href={route("task.edit", task.id)}>Modifica</Link>
                <Link className="px-2" href={route("task.destroy", task.id)}>
                  Elimina
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </dir>
    </>
  );
}
