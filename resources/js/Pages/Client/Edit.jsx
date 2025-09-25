import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, client }) {
  const { data, setData, put, errors, reset } = useForm({
    name: client.name || "",
    surname: client.surname || "",
    cod_fiscale: client.cod_fiscale || "",
    address1: client.address1 || "",
    address2: client.address2 || "",
    address3: client.address3 || "",
    address4: client.address4 || "",
    address5: client.address5 || "",
    address6: client.address6 || "",
    tel: client.tel || "",
    cell: client.cell || "",
    note1: client.note1 || "",
    contact: client.contact || "",
    contact3: client.contact3 || "",
    email: client.email || "",
    email2: client.email2 || "",
    note2: client.note2 || "",
    sex: client.sex || "",
    note3: client.note3 || "",
    note4: client.note4 || "",
    percentage: client.percentage || "",
    aliquota: client.aliquota || "",
    bonifico: client.bonifico || "",
    giorni: client.giorni || "",
    note5: client.note5 || "",
    note6: client.note6 || "",
    note7: client.note7 || "",
    note8: client.note8 || "",
    note9: client.note9 || "",
  });

  const onSubmit = (e) => {
    e.preventDefault();

    put(route("client.update", client.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica Cliente "{client.name}"
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
                <InputLabel htmlFor="client_name" value="Nome" />

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
                <InputLabel htmlFor="client_surname" value="Cognome" />

                <TextInput
                  id="surname"
                  type="text"
                  name="surname"
                  value={data.surname}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("surname", e.target.value)}
                />

                <InputError message={errors.surname} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address1" value="Indirizzo 1" />

                <TextInput
                  id="address1"
                  type="text"
                  name="address1"
                  value={data.address1}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address1", e.target.value)}
                />

                <InputError message={errors.address1} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address2" value="Indirizzo 2" />

                <TextInput
                  id="address2"
                  type="text"
                  name="address2"
                  value={data.address2}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address2", e.target.value)}
                />

                <InputError message={errors.address2} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address3" value="Indirizzo 3" />

                <TextInput
                  id="address3"
                  type="text"
                  name="address3"
                  value={data.address3}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address3", e.target.value)}
                />

                <InputError message={errors.address3} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address4" value="Indirizzo 4" />

                <TextInput
                  id="address4"
                  type="text"
                  name="address4"
                  value={data.address4}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address4", e.target.value)}
                />

                <InputError message={errors.address4} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address5" value="Indirizzo 5" />

                <TextInput
                  id="address5"
                  type="text"
                  name="address5"
                  value={data.address5}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address5", e.target.value)}
                />

                <InputError message={errors.address5} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_address6" value="Indirizzo 6" />

                <TextInput
                  id="address6"
                  type="text"
                  name="address6"
                  value={data.address6}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("address6", e.target.value)}
                />

                <InputError message={errors.address6} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note1" value="Notetel" />

                <TextInput
                  id="client_note1"
                  type="text"
                  name="note1"
                  value={data.note1}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("note1", e.target.value)}
                />

                <InputError message={errors.note1} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_tel" value="Telefono" />

                <TextInput
                  id="client_tel"
                  type="text"
                  name="tel"
                  value={data.tel}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("tel", e.target.value)}
                />

                <InputError message={errors.tel} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_cell" value="Cellulare" />

                <TextInput
                  id="client_cell"
                  type="text"
                  name="cell"
                  value={data.cell}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("cell", e.target.value)}
                />

                <InputError message={errors.cell} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_contact" value="Contatti" />

                <TextInput
                  id="client_contact"
                  name="contact"
                  value={data.contact}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("contact", e.target.value)}
                />

                <InputError message={errors.contact} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_email" value="Email" />

                <TextInput
                  id="client_email"
                  name="email"
                  value={data.email}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("email", e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_email2" value="Email 2" />

                <TextInput
                  id="client_email2"
                  name="email2"
                  value={data.email2}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("email2", e.target.value)}
                />

                <InputError message={errors.email2} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note2" value="Note 2" />

                <TextInput
                  id="client_note2"
                  name="note2"
                  value={data.note2}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note2", e.target.value)}
                />

                <InputError message={errors.note2} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_sex" value="Sesso" />

                <TextInput
                  id="client_sex"
                  name="sex"
                  value={data.sex}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("sex", e.target.value)}
                />

                <InputError message={errors.sex} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note3" value="Note 3" />

                <TextInput
                  id="client_note3"
                  name="note3"
                  value={data.note3}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note3", e.target.value)}
                />

                <InputError message={errors.note3} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_percentage" value="Percentuale" />

                <TextInput
                  id="client_percentage"
                  name="percentage"
                  value={data.percentage}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("percentage", e.target.value)}
                />

                <InputError message={errors.percentage} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_aliquota" value="Aliquota" />

                <TextInput
                  id="client_aliquota"
                  name="aliquota"
                  value={data.aliquota}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("aliquota", e.target.value)}
                />

                <InputError message={errors.aliquota} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_bonifico" value="Bonifico" />

                <TextInput
                  id="client_bonifico"
                  name="bonifico"
                  value={data.bonifico}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("bonifico", e.target.value)}
                />

                <InputError message={errors.bonifico} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_giorni" value="Giorni" />

                <TextInput
                  id="client_giorni"
                  name="giorni"
                  value={data.giorni}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("giorni", e.target.value)}
                />

                <InputError message={errors.giorni} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note5" value="Note 5" />

                <TextInput
                  id="client_note5"
                  name="note5"
                  value={data.note5}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note5", e.target.value)}
                />

                <InputError message={errors.note5} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note6" value="Note 6" />

                <TextInput
                  id="client_note6"
                  name="note6"
                  value={data.note6}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note6", e.target.value)}
                />

                <InputError message={errors.note6} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note7" value="Note 7" />

                <TextInput
                  id="client_note7"
                  name="note7"
                  value={data.note7}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note7", e.target.value)}
                />

                <InputError message={errors.note7} className="mt-2" />
              </div>
              <div className="mt-4">
                <InputLabel htmlFor="client_note8" value="Note 8" />

                <TextInput
                  id="client_note8"
                  name="note8"
                  value={data.note8}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note8", e.target.value)}
                />

                <InputError message={errors.note8} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="client_note9" value="Note 9" />

                <TextInput
                  id="client_note9"
                  name="note9"
                  value={data.note9}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("note9", e.target.value)}
                />

                <InputError message={errors.note9} className="mt-2" />
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
