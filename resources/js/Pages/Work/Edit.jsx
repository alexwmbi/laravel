import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, work }) {
  const { data, setData, put, errors, reset } = useForm({
    name: work.name || "",
    status: work.status || "",
    note: work.note || "",
    starting_date: work.starting_date || "",
    due_date: work.due_date || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(route("work.update", work.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Lavoro "{work.name}"
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
                <InputLabel htmlFor="work_name" value="Work Name" />

                <TextInput
                  id="work_name"
                  type="text"
                  name="name"
                  value={data.name}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("name", e.target.value)}
                />

                <InputError message={errors.name} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_status" value="Stato Lavoro" />

                <SelectInput
                  name="status"
                  id="work_status"
                  value={data.status}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("status", e.target.value)}
                >
                  <option value="">Seleziona Stato</option>
                  <option value="active">Attivo</option>
                  <option value="archived">Archiviato</option>
                </SelectInput>

                <InputError message={errors.work_status} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_note" value="Descrizione" />

                <TextInput
                  id="work_note"
                  type="text"
                  name="note"
                  defaultValue={data.note}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("note", e.target.value)}
                />

                <InputError message={errors.note} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_starting_date" value="Data Inizio" />

                <TextInput
                  id="work_starting_date"
                  type="date"
                  name="starting_date"
                  value={data.starting_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("starting_date", e.target.value)}
                />

                <InputError message={errors.starting_date} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_due_date" value="Data Consegna" />

                <TextInput
                  id="work_due_date"
                  type="date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
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
