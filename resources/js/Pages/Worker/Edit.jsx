import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, worker }) {
  const { data, setData, put, errors, reset } = useForm({
    name: worker.name || "",
    code: worker.code || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(route("worker.update", worker.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Lavoro "{worker.name}"
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
                <InputLabel htmlFor="worker_name" value="Worker Name" />

                <TextInput
                  id="worker_name"
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
                <InputLabel htmlFor="worker_code" value="Worker Code" />

                <TextInput
                  id="worker_code"
                  type="text"
                  name="code"
                  value={data.code}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("code", e.target.value)}
                />

                <InputError message={errors.code} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("worker.index")}
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
