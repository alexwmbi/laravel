import TextInput from "@/Components/TextInput";
import { Link, router } from "@inertiajs/react";

export default function WorkTasksTable({ work, tasks, queryParams }) {
  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("work.show", work.id), queryParams);
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;

    searchFieldChanged(name, e.target.value);
  };

  const deleteTask = (task) => {
    if (!window.confirm("Vuoi eliminare questo task?")) {
      return;
    }
    router.delete(route("task.destroy", task.id));
  };

  return (
    <>
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-900 dark:text-gray-400">
          <thead className="text-xs text-gray-400 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2">NAME</th>
              <th className="px-3 py-2">CODICE</th>
              <th className="px-3 py-2">CATEGORIA</th>
              <th className="px-3 py-2">DESCRIZIONE</th>
              <th className="px-3 py-2">DATA INIZIO</th>
              <th className="px-3 py-2">DATA FINE</th>
              <th className="px-3 py-2">NOTE</th>
              <th className="px-3 py-2">AZIONI</th>
            </tr>
          </thead>
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2"></th>
              <th className="px-3 py-2">
                <TextInput
                  className="w-full"
                  defaultValue={queryParams.name}
                  placeholder="Nome Task"
                  onBlur={(e) => searchFieldChanged("name", e.targed.value)}
                  onKeyPress={(e) => onKeyPress("name", e)}
                />
              </th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.data.map((task) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                key={task.id}
              >
                <th className="px-3 py-2 text-white ">
                  <p className="text-black hover:text-indigo-600">
                    <Link href={route("task.show", task.id)}>{task.name}</Link>
                  </p>
                </th>
                <td className="px-3 py-2">{task.code}</td>
                <td className="px-3 py-2">{task.category}</td>
                <td className="px-3 py-2">{task.description}</td>
                <td className="px-3 py-2">{task.starting_date}</td>
                <td className="px-3 py-2">{task.due_date}</td>
                <td className="px-3 py-2">{task.note}</td>

                <td className="px-3 py-2 text-nowrap">
                  <Link
                    href={route("task.edit", task)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-1"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={(e) => deleteTask(task)}
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
