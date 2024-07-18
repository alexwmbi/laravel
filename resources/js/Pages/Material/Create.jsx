import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
  const { data, setData, post, errors, reset } = useForm({
    cod_art: "",
    cod_prod: "",
    name_prod: "",
    desc: "",
    um: "",
    priece: "",
    iva: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("material.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Nuovo Materiale
          </h2>
        </div>
      }
    >
      <Head title="Clienti" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="cod_art" value="Codice Articolo" />

                <TextInput
                  id="cod_art"
                  type="text"
                  name="cod_art"
                  value={data.cod_art}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cod_art", e.target.value)}
                />

                <InputError message={errors.cod_art} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="cod_prod" value="Codice Prodotto" />

                <TextInput
                  id="cod_prod"
                  type="text"
                  name="cod_prod"
                  value={data.cod_prod}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cod_prod", e.target.value)}
                />

                <InputError message={errors.cod_prod} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="name_prod" value="Nome Prodotto" />

                <TextInput
                  id="name_prod"
                  type="text"
                  name="name_prod"
                  value={data.name_prod}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("name_prod", e.target.value)}
                />

                <InputError message={errors.name_prod} className="mt-2" />
              </div>

             
              <div className="mt-4">
                <InputLabel htmlFor="desc" value="Descrizione" />

                <TextAreaInput
                  id="desc"
                  name="desc"
                  value={data.desc}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("desc", e.target.value)}
                />

                <InputError message={errors.desc} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="um" value="Unita di Misura" />

                <TextInput
                  id="um"
                  type="text"
                  name="um"
                  value={data.um}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("um", e.target.value)}
                />

                <InputError message={errors.um} className="mt-2" />
              </div>



              <div className="mt-4">
                <InputLabel htmlFor="priece" value="Prezzo" />

                <TextInput
                  id="priece"
                  type="text"
                  name="priece"
                  value={data.priece}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("priece", e.target.value)}
                />

                <InputError message={errors.priece} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="iva" value="Iva" />

                <TextInput
                  id="iva"
                  type="text"
                  name="iva"
                  value={data.iva}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("iva", e.target.value)}
                />

                <InputError message={errors.iva} className="mt-2" />
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
