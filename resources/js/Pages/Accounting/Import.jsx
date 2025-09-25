import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Import({ auth, success }) {
  const { data, setData, post, errors, reset } = useForm({
    xml_data: "", // nome corretto del campo per il controller
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("accounting.store"), {
      forceFormData: true, // fondamentale per l'invio di file
    });
  };

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
              method="POST"
              encType="multipart/form-data" // necessario per i file
              className="p-2 sm:p-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div>
                <InputLabel
                  htmlFor="xml_data"
                  value="Carica file XML"
                  className="text-xl py-3"
                />
                <input
                  id="xml_data"
                  type="file"
                  name="xml_data"
                  className="mt-1 block w-full text-white bg-gray-800"
                  multiple
                  onChange={(e) => setData("xml_data", e.target.files)}
                />
                <InputError message={errors.xml_data} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("material.index")}
                  className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                >
                  Annulla
                </Link>
                <button
                  type="submit"
                  className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
                >
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
