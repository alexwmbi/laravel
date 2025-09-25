import TextInput from "@/Components/TextInput";
import { Link, router } from "@inertiajs/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";

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
    router.get(route("work.show", work.id), queryParams);
  };

  const taskShow = (task) => {
    router.get(route("task.show", task.id), queryParams);
  };

  const deleteTask = (task) => {
    if (!window.confirm("Vuoi eliminare questa lavorazione ?")) {
      return;
    }
    router.delete(route("task.destroy", task.id));
  };

  return (
    <>
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-900 dark:text-gray-400">
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
              <th onClick={(e) => sortChanged("code")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  CODICE
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "code" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "code" &&
                        queryParams.sort_direction === "desc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                  </div>
                </div>
              </th>
              <th onClick={(e) => sortChanged("category")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  DESCRIZIONE
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "category" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "category" &&
                        queryParams.sort_direction === "desc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                  </div>
                </div>
              </th>
              <th onClick={(e) => sortChanged("description")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  CATEGORIA
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "description" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "description" &&
                        queryParams.sort_direction === "desc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                  </div>
                </div>
              </th>
              <th onClick={(e) => sortChanged("starting_date")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  DATA INIZIO
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "starting_date" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "starting_date" &&
                        queryParams.sort_direction === "desc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                  </div>
                </div>
              </th>
              <th onClick={(e) => sortChanged("due_date")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  DATA FINE
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "due_date" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "due_date" &&
                        queryParams.sort_direction === "desc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                  </div>
                </div>
              </th>
              <th onClick={(e) => sortChanged("note")}>
                <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                  NOTE
                  <div>
                    <ChevronUpIcon
                      className={
                        "w-4 " +
                        (queryParams.sort_field === "note" &&
                        queryParams.sort_direction === "asc"
                          ? "text-black"
                          : "text-gray-500")
                      }
                    />
                    <ChevronDownIcon
                      className={
                        "w-4 -mt-2 " +
                        (queryParams.sort_field === "note" &&
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
                  defaultValue={queryParams.name}
                  placeholder="Nome Lavorazione"
                  onBlur={(e) => searchFieldChanged("name", e.target.value)}
                  onKeyPress={(e) => onKeyPress("name", e)}
                />
              </th>
              <th className="px-3 py-2">
                <TextInput
                  className="w-full"
                  defaultValue={queryParams.code}
                  placeholder="Codice"
                  onBlur={(e) => searchFieldChanged("code", e.target.value)}
                  onKeyPress={(e) => onKeyPress("code", e)}
                />
              </th>
              <th className="px-3 py-2">
                <TextInput
                  className="w-full"
                  defaultValue={queryParams.description}
                  placeholder="Codice"
                  onBlur={(e) =>
                    searchFieldChanged("description", e.target.value)
                  }
                  onKeyPress={(e) => onKeyPress("description", e)}
                />
              </th>
              <th className="px-3 py-2">
                <TextInput
                  className="w-full"
                  defaultValue={queryParams.category}
                  placeholder="Categoria"
                  onBlur={(e) => searchFieldChanged("category", e.target.value)}
                  onKeyPress={(e) => onKeyPress("category", e)}
                />
              </th>

              <th className="px-3 py-2">
                <div className="flex ">
                  <p className="py-3 px-2">DA</p>

                  <TextInput
                    id="starting_date_from"
                    type="date"
                    name="starting_date_from"
                    value={queryParams.starting_date_from}
                    className="mt-1 block max-h-7 "
                    onChange={(e) =>
                      //setData("starting_date_from", e.target.value)
                      searchFieldChanged("starting_date_from", e.target.value)
                    }
                  />
                </div>

                <div className="flex ">
                  <p className="py-3 px-3">A</p>

                  <TextInput
                    id="starting_date_to"
                    type="date"
                    name="starting_date_to"
                    value={queryParams.starting_date_to}
                    className="mt-1 block max-h-7"
                    onChange={(e) =>
                      //setData("starting_date_from", e.target.value)
                      searchFieldChanged("starting_date_to", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-3 py-2">
                <div className="flex ">
                  <p className="py-3 px-2">DA</p>

                  <TextInput
                    id="due_date_from"
                    type="date"
                    name="due_date_from"
                    value={queryParams.due_date_from}
                    className="mt-1 block max-h-7"
                    onChange={(e) =>
                      //setData("starting_date_from", e.target.value)
                      searchFieldChanged("due_date_from", e.target.value)
                    }
                  />
                </div>

                <div className="flex ">
                  <p className="py-3 px-3">A</p>

                  <TextInput
                    id="due_date_to"
                    type="date"
                    name="due_date_to"
                    value={queryParams.due_date_to}
                    className="mt-1 block max-h-7"
                    onChange={(e) =>
                      //setData("starting_date_from", e.target.value)
                      searchFieldChanged("due_date_to", e.target.value)
                    }
                  />
                </div>
              </th>

              <th className="px-3 py-2">
                <TextInput
                  className="w-full"
                  defaultValue={queryParams.note}
                  placeholder="Note"
                  onBlur={(e) => searchFieldChanged("note", e.target.value)}
                  onKeyPress={(e) => onKeyPress("note", e)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.data.map((task) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                key={task.id}
              >
                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black hover:text-indigo-600">
                    {task.name}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.code}
                  </div>
                </th>

                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.category}
                  </div>
                </th>

                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.description}
                  </div>
                </th>

                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.starting_date}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.due_date}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-gray-950"
                  onClick={(e) => taskShow(task)}
                >
                  <div className="text-black">
                    {task.note}
                  </div>
                </th>

                <td className="px-3 py-2 text-nowrap flex">
                  <Link
                    href={route("task.edit", task)}
                    className="font-medium text-blue-600  mx-1"
                  >
                    <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                  </Link>
                  <Link
                    href={route("task.move", task)}
                    className="font-medium text-blue-600  mx-1"
                  >
                    <ArrowUpOnSquareIcon

className="max-w-5 min-w-5 text-emerald-500" />
                  </Link>
                  <button onClick={(e) => deleteTask(task)}>
                    <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination links={tasks.meta.links} />
      </dir>
    </>
  );
}
