import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, task }) {
  const { data, setData, put, errors, reset } = useForm({
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

    put(route("task.update", task.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Task "{task.name}"
          </h2>
        </div>
      }
    >
      <Head title="Task" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="task_name" value="Task Name" />

                <TextInput
                  id="task_name"
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
                <InputLabel htmlFor="task_code" value="Codice Task" />

                <TextInput
                  id="task_code"
                  type="text"
                  name="code"
                  value={data.code}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("code", e.target.value)}
                />

                <InputError message={errors.code} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_category" value="Categoria" />

                <TextInput
                  id="task_category"
                  type="text"
                  name="category"
                  value={data.category}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("category", e.target.value)}
                />

                <InputError message={errors.category} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_description" value=" Descrizione" />

                <TextAreaInput
                  id="task_description"
                  name="description"
                  value={data.description}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("description", e.target.value)}
                />

                <InputError message={errors.description} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_starting_date" value="Data Inizio" />

                <TextInput
                  id="task_starting_date"
                  type="date"
                  name="starting_date"
                  value={data.starting_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("starting_date", e.target.value)}
                />

                <InputError message={errors.starting_date} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_due_date" value="Data Consegna" />

                <TextInput
                  id="task_due_date"
                  type="date"
                  name="due_date"
                  value={data.due_date}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("due_date", e.target.value)}
                />

                <InputError message={errors.due_date} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="task_note" value=" Note" />

                <TextAreaInput
                  id="task_note"
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
