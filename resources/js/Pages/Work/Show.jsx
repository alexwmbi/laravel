import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import WorkTasksTable from "./WorkTasksTable";

export default function Show({
  auth,
  work,
  tasks,
  queryParams = null,
  success,
  client,
  client_id,
}) {
  queryParams = queryParams || {};

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
            <Link
              href={route("client.show", client_id)}
              className=" py-1 px-3 text-blue-500 transition-all">
                {client}
            </Link>
            {`> ${work.name} > Tasks`}
          </h2>
          <Link
            href={route("task.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
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
              <WorkTasksTable
                tasks={tasks}
                work={work}
                queryParams={queryParams}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
