import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";
import SelectInput from "@/Components/SelectInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Taskfromcall({ auth, client, works, queryParams }) {
  queryParams = queryParams || {};

  const { data, setData, post, errors, reset } = useForm({
    client: client,
    oggetto: "",
    note: "",
    tipo: "",
    urgenza: "",
    note2: "",
    cliente: "",
    data: "",
    stato: "",
    modulo: "",
    cantiere: "",
    work_id: "",
    work_name: "",
    client_id: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("call.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {`Nuova Chiamata`}
          </h2>
        </div>
      }
    >
      <Head title="Task" />
      {/* <pre>{JSON.stringify(works, undefined, 1)}</pre> */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="client" value="Lavoro " />

                <SelectInput
                  className="w-full"
                  defaultValue={queryParams.work}
                  onChange={(e) => setData("work", e.target.value)}
                >
                  <option value="">Seleziona Lavoro</option>
                  {works.map((work) => (
                    <option value={work.id}>{work.name}</option>
                  ))}
                </SelectInput>
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="oggetto" value="Oggetto" />

                <TextInput
                  id="oggetto"
                  type="text"
                  name="oggetto"
                  value={data.oggetto}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("oggetto", e.target.value)}
                />

                <InputError message={errors.oggetto} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="note" value="Note" />

                <TextAreaInput
                  id="note"
                  type="text"
                  name="note"
                  value={data.note}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("note", e.target.value)}
                />

                <InputError message={errors.note} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="tipo" value="Tipo" />

                <TextInput
                  id="tipo"
                  type="text"
                  name="tipo"
                  value={data.tipo}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("tipo", e.target.value)}
                />

                <InputError message={errors.tipo} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="urgenza" value="Urgenza" />

                <TextInput
                  id="urgenza"
                  type="text"
                  name="urgenza"
                  value={data.urgenza}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("urgenza", e.target.value)}
                />

                <InputError message={errors.urgenza} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="note2" value="Note2" />

                <TextInput
                  id="note2"
                  type="text"
                  name="note2"
                  value={data.note2}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("note2", e.target.value)}
                />

                <InputError message={errors.note2} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="cliente" value="Cliente" />

                <TextInput
                  id="cliente"
                  type="text"
                  name="cliente"
                  value={data.cliente}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cliente", e.target.value)}
                />

                <InputError message={errors.cliente} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="data" value="Data" />

                <TextInput
                  id="data"
                  type="text"
                  name="data"
                  value={data.data}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("data", e.target.value)}
                />

                <InputError message={errors.data} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="stato" value="Stato" />

                <TextInput
                  id="stato"
                  type="text"
                  name="stato"
                  value={data.stato}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("stato", e.target.value)}
                />

                <InputError message={errors.stato} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="modulo" value="Modulo" />

                <TextInput
                  id="modulo"
                  type="text"
                  name="modulo"
                  value={data.modulo}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("modulo", e.target.value)}
                />

                <InputError message={errors.modulo} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="cantiere" value="Cantiere" />

                <TextInput
                  id="cantiere"
                  type="text"
                  name="cantiere"
                  value={data.cantiere}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cantiere", e.target.value)}
                />

                <InputError message={errors.cantiere} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_id" value="Work ID" />

                <TextInput
                  id="work_id"
                  type="text"
                  name="work_id"
                  value={data.work_id}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("work_id", e.target.value)}
                />

                <InputError message={errors.work_id} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="work_name" value="Work Name" />

                <TextInput
                  id="work_name"
                  type="text"
                  name="work_name"
                  value={data.work_name}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("work_name", e.target.value)}
                />

                <InputError message={errors.work_name} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_id" value="Client ID" />

                <TextInput
                  id="client_id"
                  type="text"
                  name="client_id"
                  value={data.client_id}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("client_id", e.target.value)}
                />

                <InputError message={errors.client_id} className="mt-2" />
              </div>

              {/*    <div className="mt-4">
                <InputLabel htmlFor="task_note" value="Note" />

                <TextAreaInput
                  id="task_note"
                  name="task_note"
                  value={data.note}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note", e.target.value)}
                />

                <InputError message={errors.note} className="mt-2" />
              </div> */}

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
