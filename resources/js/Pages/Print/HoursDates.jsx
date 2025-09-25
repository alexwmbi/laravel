import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import InputLabel from "@/Components/CurrentDate";

import WorkTasksTable from "../Work/WorkTasksTable";
import CurrentDate from "@/Components/CurrentDate";

// ELENCO TASK ORE E PREZZI
// ELENCO MATERIALI CON PREZZI
// PREZZO TOTALE LAVORO
// ALLEGATI

export default function Show({
  auth,
  taskworker,
  queryParams = null,
}) {
  queryParams = queryParams || {};

  /* const PrintPdf = () => {
return(
  <div>

<script src="pdf.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>

  </div>
)


  } */

  const downloadPdf = () => {
    const invoice = document.getElementById("invoice").innerHTML;
    var opt = {
      margin: 0,
      filename: "myfile.pdf",
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 1,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    };
    html2pdf().from(invoice).set(opt).save();
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
            {`Conformita`}
          </h2>
          {/*     <div className="col-md-12 text-right mb-3">
                <button id="download" >download pdf</button>
            </div> */}

          <button
            onClick={() => downloadPdf()}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Download
          </button>

          {/*  <Link
           
            id="download" className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Stampa
          </Link> */}
        </div>
      }
    >
      {/* <pre>{JSON.stringify(clientData, undefined, 1)}</pre> */}
      <div className="py-12 bg-white" id="invoice">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="content-start">
              <p className="text-2xl align-top">CASTELLARE IMPIANTI S.N.C.</p>
              <p className="text-xl align-top">di Mariottini Daniele & C.</p>
            </div>
            <div className="border-2 border-black-900 m-1 p-3 sm:rounded-lg">
              <p>
                Data <CurrentDate />
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden  sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Elenco Lavorazioni
                </h2>
              </div>
              <dir className="overflow-auto">
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap bg-gray-100">
                    <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">NOME</th>
                      <th className="px-3 py-2">DESCRIZIONE</th>
                      <th className="px-3 py-2">TOTALE ORE</th>
                      <th className="px-3 py-2">TOTALE MATERIALI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskworker.data.map((task) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                        key={task.id}
                      >
                        <td className="px-3 py-2">{task.work_name}</td>
                        <td className="px-3 py-2">{task.category}</td>
                        <td className="px-3 py-2">{task.starting_date}</td>
                        <td className="px-3 py-2">{task.due_date}</td>
                        {/* <td className="px-3 py-2">{task.materials}</td> */}
                        <td className="px-3 py-2">{task.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dir>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
