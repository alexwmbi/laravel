import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import { TrashIcon } from "@heroicons/react/16/solid";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

export default function ImportMaterial({ auth, success }) {
  const { data, setData, post, errors, reset } = useForm({
    files: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    //post(route("work.store"));
    post(route("import.store"));
  };

  const deleteFile = (file) => {
    if (!window.confirm("Vuoi eliminare il file?")) {
      return;
    }
    router.delete(route("attach.destroy", file.id));
  };

  function changeUrl() {
    return (location.href = location.href.replace(
      "/work/attach/",
      "/storage/"
    ));
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
           Importa Catalogo
          </h2>
        </div>
      }
    >
      <Head title="Importa Catalogo Fornitore" />
      {success && (
        <div className="bg-emerald-500 py-2 px-4 text-white rounded">
          {success}
        </div>
      )}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-2 sm:p-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
              method="POST"
            >
              <div>
                <InputLabel
                  htmlFor="attached_path"
                  value="Carica Catalogo"
                  className="text-xl py-3"
                />
                <TextInput
                  id="excel_data"
                  type="file"
                  name="excel_data"
                  className="mt-1 block w-full"
                  onChange={(e) => setData("excel_data", e.target.files)}
                />
                <InputError message={errors.files} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("material.index")}
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
