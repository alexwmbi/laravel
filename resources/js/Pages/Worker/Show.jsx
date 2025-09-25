import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import WorkerTasksTable from "./WorkerTasksTable";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";

import { Head, Link, router, useForm } from "@inertiajs/react";

export default function Show({ auth, worker, taskworker, queryParams = null }) {
  const n = 1;
  queryParams = queryParams || {};
  taskworker = taskworker || {};

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("worker.show", worker[0].id), queryParams);
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
    router.get(route("worker.show", worker), queryParams);
  };

  const popolateQury = () => {
    //queryParams = queryParams;
   // queryParams["selectedItemsTask"] = selectedItemsTask;
    //router.get(route("work.invoicePrint", work), queryParams);
    router.get(route("worker.hoursDates", worker), queryParams);
  };

  /*
const submit = (e) => {
  data.customer_id = document.querySelector('[name="customer_id[id]"]').value
  post(route("resources.orders.store"), data)
} */

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {/* <pre>{JSON.stringify(worker,undefined, 2)}</pre>   */}
            {`Lavorazioni  ${worker[0].name}`}
          </h2>

          <div className="flex flex-row space-x-4 ">
          <button
                  onClick={(e) => popolateQury()}
                  className="bg-purple-200 py-1 px-3 text-purple-500 rounded shadow transition-all hover:bg-purple-400 hover:text-white"
                >
                 Stampa Ore
                </button>

           {/*  <Link
              href={route("worker.hoursDates", worker ,queryParams)}
              className="bg-purple-200 py-1 px-3 text-purple-500 rounded shadow transition-all hover:bg-purple-400 hover:text-white"
            >
              Stampa Ore
            </Link> */}
          </div>
        </div>
      }
    >
      <Head title={`Lavori ${worker.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-1 text-gray-900 dark:text-gray-100"></div>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th onClick={(e) => sortChanged("name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        LAVORAZIONI
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
                    <th onClick={(e) => sortChanged("work_name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        LAVORO
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "work_name" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "work_name" &&
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
                        CATEGORIA
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

                    {/* <th className="px-3 py-2">DESCRIZIONE</th>
                    <th className="px-3 py-2">NOTE</th> */}
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
                        DATA CONSEGNA
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
                    <th onClick={(e) => sortChanged("hours")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        ORE
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "hours" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "hours" &&
                              queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.task_name}
                        placeholder="Nome Lavorazione"
                        onBlur={(e) =>
                          searchFieldChanged("task_name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("task_name", e)}
                      />
                    </th>
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.work_name}
                        placeholder="Nome Lavoro"
                        onBlur={(e) =>
                          searchFieldChanged("work_name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("work_name", e)}
                      />
                    </th>
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.category}
                        placeholder="Categoria"
                        onBlur={(e) =>
                          searchFieldChanged("category", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("category", e)}
                      />
                    </th>
                    {/* <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th> */}
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
                            searchFieldChanged(
                              "starting_date_from",
                              e.target.value
                            )
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
                            searchFieldChanged(
                              "starting_date_to",
                              e.target.value
                            )
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
                  </tr>
                </thead>
                <tbody>
                  {taskworker.data.map((work) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={work.id}
                    >
                      {/* <td className="px-3 py-2">{work.id}</td> */}
                      <th className="px-3 py-2 text-white ">
                        <p className="text-black">
                          <Link href={route("task.show", work.id)}>
                            {work.name}
                          </Link>
                        </p>
                      </th>

                      <td className="px-3 py-2">
                        <p className="text-black">
                          <Link href={route("task.show", work.id)}>
                            {work.work_name}
                          </Link>
                        </p>
                      </td>
                      <td className="px-3 py-2">{work.category}</td>

                      {/* <td className="px-3 py-2">{work.description}</td>
        <td className="px-3 py-2">{work.note}</td> */}
                      <td className="px-3 py-2">{work.starting_date}</td>
                      <td className="px-3 py-2">{work.due_date}</td>
                      <td className="px-3 py-2">{work.hours}</td>
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
