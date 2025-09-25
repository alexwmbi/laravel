import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Move( { auth, works, task, queryParams }) {
    queryParams = queryParams || {};
  const { data, setData, post, errors, reset } = useForm({
    workId: "",
    id: task.id || "",
    name: task.name || "",
    code: task.code || "",
    category: task.category || "",
    description: task.description || "",
    starting_date: task.starting_date || "",
    due_date: task.due_date || "",
    note: task.note || "",

  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("task.moveTask"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
             Sposta Lavorazione
          </h2>
        </div>
      }
    >
      <Head title="Lavori" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >


             <div className="mt-4">
                 <InputLabel htmlFor="lavoro"  />

                 <SelectInput
                   className="w-full"
                   defaultValue={queryParams.client}
                   onChange={(e) => setData("workId", e.target.value)}
                 >
                   <option value="">Seleziona Lavoro</option>
                   {works.map((work) => (
                     <option value={work.id}>{work.name}</option>
                   ))}
                 </SelectInput>
               </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("work.index")}
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
    </AuthenticatedLayout>
  );
}

