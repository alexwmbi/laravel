import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import TaskTable from "./TaskTable";
import WorkersDetailsTable from "./WorkersDetailsTable";
import MaterialsDetailsTable from "./MaterialsDetailsTable";

export default function Show({
  auth,
  task,
  workersdetails,
  materialsdetails,
  hoursTot,
  materialsTot,
  queryParams = null,
}) {
  queryParams = queryParams || {};

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
          {`Task > ${task.name}`}
        </h2>
      }
    >
      <Head title="Lavori" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <TaskTable
                task={task}
                hoursTot={hoursTot}
                materialsTot={materialsTot}
              />
            </div>
          </div>
          <div className="my-6 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-4 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Materiali
                </h2>
                <Link
                  href={route("detailmaterial.index", task)}
                  className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
                >
                  Aggiungi Materiale
                </Link>
              </div>

              <MaterialsDetailsTable materialsdetails={materialsdetails} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Operai
                </h2>
                <Link
                  href={route("detailwork.index", task)}
                  className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
                >
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
