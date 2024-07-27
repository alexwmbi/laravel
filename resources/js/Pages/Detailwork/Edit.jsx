import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, workerdetail }) {
  const { data, setData, put, errors, reset } = useForm({
    /*  id" => 29
    "name" => "ttttttttttt"
    "code" => "4444444"
    "worker_id" => "11"
    "hours" => "55.00"
    "client" => null
    "work" => null
    "task" => "1"
    "note" => null
    "status" => null
    "starting_date" => null
    "end_date" => null
    "created_at" => "2024-07-17 11:39:32"
    "updated_at" => "2024-07-17 11:39:32" */

    name: workerdetail.name || "",
    hours: workerdetail.hours || "",
    note: workerdetail.note || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(route("detailwork.update", workerdetail));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Operaio "{workerdetail.name}"
          </h2>
        </div>
      }
    >
      <Head title="Operai" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="worker_name" value="Nome Operaio" />

                <TextInput
                  id="worker_name"
                  type="text"
                  name="name"
                  value={data.name}
                  className="mt-1 block w-full"
                  readOnly="readonly"
                  isFocused={true}
                  onChange={(e) => setData("name", e.target.value)}
                />

                <InputError message={errors.name} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="worker_id" value="Codice Operaio" />

                <TextInput
                  id="worker_id"
                  type="text"
                  name="id"
                  value={data.id}
                  className="mt-1 block w-full"
                  readOnly="readonly"
                  isFocused={true}
                  onChange={(e) => setData("id", e.target.value)}
                />

                <InputError message={errors.id} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="hours" value="Ore" />

                <TextInput
                  id="hours"
                  type="text"
                  name="contact"
                  value={data.hours}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("hours", e.target.value)}
                />

                <InputError message={errors.hours} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="worker_note" value="Note" />

                <TextAreaInput
                  id="worker_note"
                  name="note"
                  value={data.note}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note", e.target.value)}
                />

                <InputError message={errors.note} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("client.index")}
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
