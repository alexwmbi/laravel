import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import { TrashIcon } from "@heroicons/react/16/solid";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

export default function Attach({ auth, work, file_path }) {
  const { data, setData, post, errors, reset } = useForm({
    files: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    //post(route("work.store"));
    post(route("attach.store"));
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
            Allegati {` ${work.name}`}
          </h2>
        </div>
      }
    >
      <Head title="Allegati" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-2 sm:p-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div>
                <InputLabel
                  htmlFor="attached_path"
                  value="Carica allegati"
                  className="text-xl py-3"
                />
                <TextInput
                  id="attached_path"
                  type="file"
                  name="files"
                  className="mt-1 block w-full"
                  multiple
                  onChange={(e) => setData("files", e.target.files)}
                />
                <InputError message={errors.files} className="mt-2" />
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("work.show", work.id)}
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

      <div className="py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg min-h-20 p-5">
            <InputLabel
              htmlFor="attached_path"
              value="Allegati"
              className="text-xl py-3"
            />
            <ul>
              {file_path.map((file) => (
                <li className=" hover:bg-purple-100 p-2" key={file.id}>
                  <div className="flex justify-between items-center">
                    {/* http://127.0.0.1:8000/storage/attach/NsgG6j2TQMc8jSaU/Alessandro%20Panigada%20CV%20(1).pdf */}
                    {/* <a href={file.fileurl.replace('attach/','http://127.0.0.1:8000/storage/attach/')} download={file.name} target="_blank" >
                    {file.filename}
                  </a>  */}

                    <a
                      href={file.fileurl.replace(
                        "attach/",
                        "https://sandybrown-eagle-907746.hostingersite.com/storage/attach/"
                      )}
                      download={file.name}
                      target="_blank"
                    >
                      {file.filename}
                    </a>

                    <button onClick={(e) => deleteFile(file)}>
                      <TrashIcon className="max-w-5 min-w-5 text-red-500" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
