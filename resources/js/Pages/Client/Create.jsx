import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
  const { data, setData, post, errors, reset } = useForm({
    name: "",
    contact: "",
    address: "",
    piva: "",
    note: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("client.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Nuovo Cliente
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
                <InputLabel htmlFor="client_name" value="Client Name" />

                <TextInput
                  id="client_name"
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
                <InputLabel htmlFor="client_contact" value="Client Contact" />

                <TextInput
                  id="client_contact"
                  type="text"
                  name="contact"
                  value={data.contact}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("contact", e.target.value)}
                />

                <InputError message={errors.contact} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address" value="Client Address" />

                <TextInput
                  id="client_address"
                  type="text"
                  name="address"
                  value={data.address}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address", e.target.value)}
                />

                <InputError message={errors.address} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_piva" value="Client Piva" />

                <TextInput
                  id="client_piva"
                  type="text"
                  name="piva"
                  value={data.piva}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("piva", e.target.value)}
                />

                <InputError message={errors.piva} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note" value="Client  Note" />

                <TextAreaInput
                  id="client_note"
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
