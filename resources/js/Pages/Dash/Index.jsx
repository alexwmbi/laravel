import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import Pagination from "@/Components/Pagination";
import AccountingSummaryPanel from "@/Components/AccountingSummaryPanel";

export default function Index({ auth, works, accTotals = null, accQuery = null, queryParams = null }) {
  queryParams = queryParams || {};
  accQuery = accQuery || {};
  accTotals = accTotals || { count: 0, sum_docs: 0, sum_paid: 0, sum_due: 0 };

  const merged = () => ({ ...queryParams, ...accQuery });

  // === Filtri lista lavori ===
  const searchFieldChanged = (name, value) => {
    const next = merged();
    if (value) next[name] = value; else delete next[name];
    next.page = 1;
    router.get(route("dashboard.index"), next, { preserveState: true });
  };

  const onKeyPress = (name, e) => {
    if (e.key !== "Enter") return;
    searchFieldChanged(name, e.target.value);
  };

  const sortChanged = (name) => {
    const next = merged();
    if (name === next.sort_field) {
      next.sort_direction = next.sort_direction === "asc" ? "desc" : "asc";
    } else {
      next.sort_field = name;
      next.sort_direction = "asc";
    }
    next.page = 1;
    router.get(route("dashboard.index"), next, { preserveState: true });
  };

  const deletework = (work) => {
    if (!window.confirm("Vuoi eliminare il lavoro?")) return;
    router.delete(route("work.destroy", work.id));
  };

  const workShow = (work) => {
    router.get(route("work.show", work.id), merged());
  };

  // === Filtri pannello contabilità (acc_*) ===
  const accFilterChanged = (name, value) => {
    const next = merged();
    if (value) next[name] = value; else delete next[name];
    router.get(route("dashboard.index"), next, { preserveState: true, replace: true });
  };

  const accReset = () => {
    const next = merged();
    delete next.acc_name;
    delete next.acc_date_from;
    delete next.acc_date_to;
    delete next.acc_stato;
    router.get(route("dashboard.index"), next, { preserveState: false, replace: true });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Lavori
          </h2>
          <Link
            href={route("work.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Lavori Attivi
          </Link>
        </div>
      }
    >
      <Head title="Lavori Attivi" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* ===== PANNELLO RIEPILOGATIVO FATTURE ===== */}
          <AccountingSummaryPanel
            queryParams={accQuery}
            totals={accTotals}
            onFilterChange={accFilterChanged}
            onReset={accReset}
            names={{
              supplier: "acc_name",
              date_from: "acc_date_from",
              date_to: "acc_date_to",
              status: "acc_stato",
            }}
          />

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th onClick={() => sortChanged("name")}>
                      <div className="px-3 py-2 flex items-center justify-between gap-1 cursor-pointer select-none">
                        NOME
                        <div>
                          <ChevronUpIcon
                            className={
                              "w-4 " +
                              (queryParams.sort_field === "name" && queryParams.sort_direction === "asc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                          <ChevronDownIcon
                            className={
                              "w-4 -mt-2 " +
                              (queryParams.sort_field === "name" && queryParams.sort_direction === "desc"
                                ? "text-black"
                                : "text-gray-500")
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-3 py-2">CONTATTI</th>
                    <th className="px-3 py-2">EMAIL</th>
                    <th className="px-3 py-2">COD. FISCALE/P.IVA</th>
                    <th className="px-3 py-2">NOTE</th>
                    <th className="px-3 py-2">AZIONI</th>
                  </tr>
                </thead>

                {/* Riga filtri lavori */}
                <thead className="text-xs text-gray-700 uppercase">
                  <tr className="text-nowrap">
                    <th className="px-3 py-2">
                      <TextInput
                      key={`name:${queryParams.name || ""}`}
                        className="w-full"
                        defaultValue={queryParams.name}
                        placeholder="Nome lavoro"
                        onBlur={(e) => searchFieldChanged("name", e.target.value)}
                        onKeyPress={(e) => onKeyPress("name", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2">
                      <TextInput
                      key={`note:${queryParams.note || ""}`}
                        className="w-full"
                        defaultValue={queryParams.note}
                        placeholder="Note"
                        onBlur={(e) => searchFieldChanged("note", e.target.value)}
                        onKeyPress={(e) => onKeyPress("note", e)}
                      />
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>

                <tbody>
                  {works.data.map((work) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                      key={work.id}
                    >
                      <th
                        className="px-3 py-2 text-gray-950 cursor-pointer"
                        onClick={() => workShow(work)}
                      >
                        <div className="text-black hover:text-indigo-600">
                          {work.name}
                        </div>
                      </th>

                      <td className="px-3 py-2 cursor-pointer" onClick={() => workShow(work)}>
                        {work.contact || work.cell || "-"}
                      </td>

                      <td className="px-3 py-2 cursor-pointer" onClick={() => workShow(work)}>
                        {work.email || work.email2 || "-"}
                      </td>

                      <td className="px-3 py-2 cursor-pointer" onClick={() => workShow(work)}>
                        {work.piva || work.cod_fiscale || "-"}
                      </td>

                      <td className="px-3 py-2 cursor-pointer" onClick={() => workShow(work)}>
                        {work.note || work.note1 || "-"}
                      </td>

                      <td className="px-3 py-2 text-nowrap flex items-center gap-2">
                        <Link href={route("work.edit", work.id)} className="font-medium text-blue-600">
                          <PencilSquareIcon className="w-5 h-5 text-blue-500" />
                        </Link>
                        <button onClick={() => deletework(work)}>
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination links={works.meta.links} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
