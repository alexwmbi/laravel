import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, materialdetail }) {
  const { data, setData, put, errors, reset } = useForm({
    /*   {material.cod_art}</h1>
    </td>
    <td>
      <h1>{material.cod_prod}</h1>
    </td>
    <td>
      <h1>{material.desc}</h1>
    </td>
    <td>
      <h1>{material.um}</h1> */

    name: materialdetail.name || "",
    code: materialdetail.code || "",
    desc: materialdetail.desc || "",
    um: materialdetail.um || "",
    quantity: materialdetail.quantity || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(route("detailmaterial.update", materialdetail));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Articolo del Task ""
          </h2>
        </div>
      }
    >
      <Head title="Materiali" />

      {/* <pre>{JSON.stringify(workerdetail,undefined, 2)}</pre>   */}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="name" value="Codice Articolo" />

                <TextInput
                  id="name"
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
                <InputLabel htmlFor="code" value="Codice Prodotto" />

                <TextInput
                  id="code"
                  type="text"
                  name="code"
                  value={data.code}
                  className="mt-1 block w-full"
                  readOnly="readonly"
                  isFocused={true}
                  onChange={(e) => setData("code", e.target.value)}
                />

                <InputError message={errors.code} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="desc" value="Descrizione" />

                <TextInput
                  id="desc"
                  type="text"
                  name="desc"
                  value={data.desc}
                  className="mt-1 block w-full"
                  readOnly="readonly"
                  isFocused={true}
                  onChange={(e) => setData("desc", e.target.value)}
                />

                <InputError message={errors.desc} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="um" value="UM" />

                <TextInput
                  id="um"
                  type="text"
                  name="um"
                  value={data.um}
                  className="mt-1 block w-full"
                  readOnly="readonly"
                  isFocused={true}
                  onChange={(e) => setData("um", e.target.value)}
                />

                <InputError message={errors.um} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="quantity" value="Quantita" />

                <TextInput
                  id="quantity"
                  type="text"
                  name="quantity"
                  value={data.quantity}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("quantity", e.target.value)}
                />

                <InputError message={errors.quantity} className="mt-2" />
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
