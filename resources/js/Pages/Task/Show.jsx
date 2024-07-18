import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import MaterialsTable from "./MaterialsTable";
import TaskTable from "./TaskTable";
import WorkersTable from "./WorkersTable";
import WorkersDetailsTable from "./WorkersDetailsTable";
import MaterialsDetailsTable from "./MaterialsDetailsTable";


export default function Show({
  auth,
  materials,
  task,
  workers,
  workersdetails,
  materialsdetails,
  hoursTot,
  materialsTot,
  queryParams = null,
}) {
  queryParams = queryParams || {};

  const showWorker = () => {
    if (!window.confirm("Vuoi eliminare l'operaio?")) {
      return;
    }
  };


  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          {`Task "${task.name}"`}
        </h2>
      }
    >
      <Head title="Lavori" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* <pre>{JSON.stringify(workers,undefined, 2)}</pre>  */}
              <TaskTable task={task} hoursTot={hoursTot} materialsTot={materialsTot} />
            </div>
          </div>
          <div className="my-6 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-4 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Materiali
                </h2>
                <Link href={route("detailmaterial.index", task)}
                className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                Aggiungi Materiale
                        </Link>                
              </div>
              {/* <pre>{JSON.stringify(materials,undefined, 2)}</pre>  */}
              {/* <MaterialsTable materials={materials} /> */}
              <MaterialsDetailsTable materialsdetails={materialsdetails} />
              
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Operai
                </h2>
                <Link href={route("detailwork.index", task)}
                className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                Aggiungi Operaio
                        </Link>                
              </div>

               {/* <pre>{JSON.stringify(workersdetails,undefined, 2)}</pre>   */}
               <WorkersDetailsTable workers={workersdetails} />
              
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
    
  );
}
