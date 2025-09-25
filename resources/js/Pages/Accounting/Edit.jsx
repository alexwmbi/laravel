import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";
import SelectInput from "@/Components/SelectInput"; 
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, detailaccounting }) {
  const { data, setData, put, errors, reset } = useForm({
    id: detailaccounting.id,
    stato: detailaccounting.stato || "",
    modalitaPagamento: detailaccounting.modalitaPagamento || "",
    dataScadenzaPagamento: detailaccounting.dataScadenzaPagamento || "",
    importoPagamento: detailaccounting.importoPagamento || "",
    note: detailaccounting.note || "",
  });

 /*  const onSubmit = (e) => {
    e.preventDefault();

    put(route("detailaccounting.update", detailaccounting.id));

  }; */

  const onSubmit = (e) => {
    e.preventDefault();
  
    put(route("detailaccounting.update", detailaccounting.id), {
      onSuccess: () => {
        console.log("Update successful!");
        // Redirigi a una pagina specifica se necessario
        window.location.href = route("accounting.index");
      },
      onError: (errors) => {
        console.error("Update failed:", errors);
      },
    });
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Modifica 
          </h2>
        </div>
      }
    >
      <Head title="Fatture" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form
              onSubmit={onSubmit}
              className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
            >
              <div className="mt-4">
                <InputLabel htmlFor="stato" value="Stato Lavoro" />

                <SelectInput
                  name="stato"
                  id="stato"
                  value={data.stato}
                  className="mt-1 block w-full"
                  onChange={(e) => setData("stato", e.target.value)}
                >
                  <option value="">Seleziona Stato</option>
                  <option value="aperta">Aperta</option>
                  <option value="archiviata">Archiviata</option>
                </SelectInput>

                <InputError message={errors.stato} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="modalitaPagamento" value="Modalita Pagamento" />

                <TextInput
                  id="modalitaPagamento"
                  type="text"
                  name="modalitaPagamento"
                  value={data.modalitaPagamento}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("modalitaPagamento", e.target.value)}
                />

                <InputError message={errors.modalitaPagamento} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="dataScadenzaPagamento" value="Data Scadenza Pagamento" />

                <TextInput
                  id="dataScadenzaPagamento"
                  type="text"
                  name="dataScadenzaPagamento"
                  value={data.dataScadenzaPagamento}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("dataScadenzaPagamento", e.target.value)}
                />

                <InputError message={errors.dataScadenzaPagamento} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="importoPagamento" value="Importo Pagamento" />

                <TextInput
                  id="importoPagamento"
                  type="text"
                  name="importoPagamento"
                  value={data.importoPagamento}
                  className="mt-1 block w-full"
                  isFocused={true}
                  onChange={(e) => setData("importoPagamento", e.target.value)}
                />

                <InputError message={errors.importoPagamento} className="mt-2" />
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

              <div className="mt-4 text-right">
                <Link
                  href={route("accounting.index")}
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
