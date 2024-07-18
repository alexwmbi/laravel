
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head , Link } from "@inertiajs/react";
import WorkTasksTable from "./WorkTasksTable";

export default function Show({ auth, work, tasks, queryParams = null, success }) {
  queryParams = queryParams || {};

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
        {`Tasks di "${work.name}"`}
        </h2>
        <Link
        href={route("task.create")}
        className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
      >
        Nuovo Task
      </Link>
        </div>
      }
    >
      <Head title="Lavori" />

      {success && (
              <div className="bg-emerald-500 py-2 px-4 text-white rounded">
                {success}
              </div>
            )}


      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
               {/* <pre>{JSON.stringify(tasks,undefined, 2)}</pre>  */}
              <WorkTasksTable tasks={tasks} work={work}  queryParams={queryParams} />
            </div>
            
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
