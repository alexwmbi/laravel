

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import TextAreaInput from "@/Components/TextAreaInput";

import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Cientfromworker( { auth, clients,  worker,   queryParams }) {
    queryParams = queryParams || {};
  const { data, setData, post, errors, reset } = useForm({
    name: "a",
    client: "",
    worker: worker,
  });

  const onSubmit = (e) => {
    e.preventDefault();

    post(route("worker.taskfromworker"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
             Nuovo Lavoro
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
                 <InputLabel htmlFor="client" value="Cliente " />

                 <SelectInput
                   className="w-full"
                   defaultValue={queryParams.client}
                   onChange={(e) => setData("client", e.target.value)}
                 >
                   <option value="">Seleziona Cliente</option>
                   {clients.map((client) => (
                     <option value={client.id}>{client.name}</option>
                   ))}
                 </SelectInput>
               </div>

              <div className="mt-4 text-right">
                <Link
                  href={route("work.index")}
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



// import InputError from "@/Components/InputError";
// import InputLabel from "@/Components/InputLabel";
// import TextAreaInput from "@/Components/TextAreaInput";
// import SelectInput from "@/Components/SelectInput";

// import TextInput from "@/Components/TextInput";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Head, Link, useForm } from "@inertiajs/react";

// export default function Cientfromworker({
//   auth,
//   clients,
//   worker,
//   queryParams,
// }) {
//   queryParams = queryParams || {};

//   const { data, setData, post, errors, reset } = useForm({
//     client: "",
//     worker: worker,

//     /*  name code materials hours description note work_id workers starting_date due_date created_at updated_at */
//   });

//   const onSubmit = (e) => {
//     e.preventDefault();

//     post(route("worker.taskfromworker"));
//   };

//   return (
//     <AuthenticatedLayout
//       user={auth.user}
//       header={
//         <div className="flex justify-between items-center">
//           <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
//             {`Nuovo Task `}
//           </h2>
//         </div>
//       }
//     >
//       <Head title="Task" />
//       <div className="py-12">
//         <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//           <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
//             <form
//               onSubmit={onSubmit}
//               className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
//             >
//               <div className="mt-4">
//                 <InputLabel htmlFor="client" value="Cliente " />

//                 <SelectInput
//                   className="w-full"
//                   defaultValue={queryParams.client}
//                   onChange={(e) => setData("client", e.target.value)}
//                 >
//                   <option value="">Seleziona Cliente</option>
//                   {clients.map((client) => (
//                     <option value={client.id}>{client.name}</option>
//                   ))}
//                 </SelectInput>
//               </div>

//               <div className="mt-4 text-right">
//                 <Link
//                   href={route("client.index")}
//                   className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
//                 >
//                   Annulla
//                 </Link>
//                 <button className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
//                   OK
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </AuthenticatedLayout>
//   );
// }
