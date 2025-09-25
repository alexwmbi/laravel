import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { WORK_STATUS_CLASS_MAP, WORK_STATUS_TEXT_MAP } from "@/constants.jsx";
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";

export default function Show({ auth, client, works, queryParams = null }) {
  queryParams = queryParams || {};

  const { setData } = useForm({
    starting_date_from: "",
    starting_date_to: "",
    due_date: "",
  });

  const searchFieldChanged = (name, value) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }

    router.get(route("client.show", client.id), queryParams);
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
    router.get(route("client.show", client.id), queryParams);
  };

  const deleteWork = (work) => {
    if (!window.confirm("Vuoi eliminare questo lavoro?")) {
      return;
    }
    router.delete(route("work.destroy", work.id));
  };

  const workShow = (work) => {
    router.get(route("work.show", work.id), queryParams);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            <Link
              href={route("client.index")}
              className=" py-1 px-3 text-blue-500 transition-all"
            >
              {`${client.name} > Lavori`}
            </Link>
          </h2>
          <Link
            href={route("work.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Nuovo Lavoro
          </Link>
        </div>
      }
    >
      <Head title={`Lavori ${client.name}`} />
      {/* <pre>{JSON.stringify(works, undefined, 1)}</pre>   */}
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
                    <th onClick={(e) => sortChanged("status")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        STATUS
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "status" &&
                              queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "status" &&
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
                    <th onClick={(e) => sortChanged("note")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        DESCRIZIONE
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
                        placeholder="Nome Lavoro"
                        onBlur={(e) =>
                          searchFieldChanged("name", e.target.value)
                        }
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 py-2 ">
                      <SelectInput
                        className="w-full"
                        defaultValue={queryParams.status}
                        onChange={(e) =>
                          searchFieldChanged("status", e.target.value)
                        }
                      >
                        <option value="">Seleziona Stato</option>
                        <option value="active">Attivo</option>
                        <option value="archived">Archiviato</option>
                      </SelectInput>
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
                    <th className="px-3 py-2">
                      <TextInput
                        className="w-full"
                        defaultValue={queryParams.note}
                        placeholder="Descrizione"
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
                  {works.data.map((work) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={work.id}
                    >
                      <th
                        className="px-3 py-2 text-gray-950"
                        onClick={(e) => workShow(work)}
                      >
                        <div className="text-black hover:text-indigo-600">
                          {work.name}
                        </div>
                      </th>

                      {/*  <th className="px-3 py-2 text-white ">
                        <p className="text-black hover:text-indigo-600">
                          <Link href={route("work.show", work.id)}>
                            {work.name}
                          </Link>
                        </p>
                      </th> */}
                      <td className="px-3 py-2" onClick={(e) => workShow(work)}>
                        <span
                          className={
                            "px-2 py-1 rounded text-white " +
                            WORK_STATUS_CLASS_MAP[work.status]
                          }
                        >
                          {WORK_STATUS_TEXT_MAP[work.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2" onClick={(e) => workShow(work)}>
                        {work.starting_date}
                      </td>
                      <td className="px-3 py-2" onClick={(e) => workShow(work)}>
                        {work.due_date}
                      </td>
                      <td className="px-3 py-2" onClick={(e) => workShow(work)}>
                        {work.note}
                      </td>
                      <td className="px-3 py-2 text-nowrap flex">
                        <Link
                          href={route("work.edit", work.id)}
                          className="font-medium text-blue-600  mx-1"
                        >
                          <PencilSquareIcon className="max-w-5 min-w-5 text-blue-500" />
                        </Link>
                        <button onClick={(e) => deleteWork(work)}>
                          <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination links={works.meta.links} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
