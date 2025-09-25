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
  detailmaterial,
  detailwork,
  work,
  tasks,
  queryParams = null,
  success,
  print,
  client,
  client_id,
  hoursTot,
  materialsTot,
  clientData,
  materialTaskDistinct,
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
              <p>Conformita Lavoro {work.name}</p>
              <p>Conformita n.{work.id}</p>
              <p>
                Data <CurrentDate />
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="border-2 border-black-900 m-1 p-3 text-sm sm:rounded-lg">              
              <p>Via del Castellare, 1</p>
              <p>51017 Pescia PT</p>
              <p>Tel. 0572 453437</p>
              <p>P.Iva 00419390471</p>
            </div>
            <div className="border-2 border-black-900 m-1 p-3 sm:rounded-lg">
              <p>{clientData.name}</p>
              <p>{clientData.address}</p>
              <p>{clientData.contact}</p>
              <p>{clientData.piva}</p>
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
                    {tasks.data.map((task) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                        key={task.id}
                      >
                        <td className="px-3 py-2">{task.id}</td>
                        <td className="px-3 py-2">{task.name}</td>
                        <td className="px-3 py-2">{task.description}</td>
                        <td className="px-3 py-2">{task.hours}</td>
                        {/* <td className="px-3 py-2">{task.materials}</td> */}
                        <td className="px-3 py-2">{materialsTot}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dir>
            </div>
          </div>
          <div className="my-6 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-4 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Materiali
                </h2>
              </div>

              <dir className="overflow-auto">
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap bg-gray-100">
                      <th className="px-3 py-2">TASK</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">DESCRIZIONE</th>
                      <th className="px-3 py-2">CODICE ARTICOLO</th>
                      <th className="px-3 py-2">PREZZO</th>
                      <th className="px-3 py-2">QUANTITA</th>
                      <th className="px-3 py-2">UM</th>
                      <th className="px-3 py-2">TOTALE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailmaterial.data.map((material) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                        key={material.id}
                      >
                        <td className="px-3 py-2">{material.task}</td>
                        <td className="px-3 py-2">{material.id}</td>
                        <td className="px-3 py-2">{material.name}</td>
                        <td className="px-3 py-2">{material.code}</td>
                        <td className="px-3 py-2">
                          {/* {material.priece} */}
                        {(material.priece * material.default_aug / 100) + (material.priece * material.custom_aug / 100) +  parseFloat (material.priece )  }
                        </td>
                        <td className="px-3 py-2">{material.quantity}</td>
                        <td className="px-3 py-2">{material.um}</td>
                        <td className="px-3 py-2">
                          {/* {material.priece * material.quantity} */}
                          {( parseFloat (material.priece * material.default_aug / 100) + parseFloat (material.priece * material.custom_aug / 100) +  parseFloat (material.priece ) ) * parseFloat (material.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dir>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  Operai
                </h2>
              </div>

              {/* <pre>{JSON.stringify(workersdetails,undefined, 2)}</pre>   */}
              <dir className="overflow-auto">
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap bg-gray-100">
                      <th className="px-3 py-2">TASK</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">NOME</th>
                      <th className="px-3 py-2">CODICE</th>
                      <th className="px-3 py-2">ORE</th>
                      {/* <th className="px-3 py-2">NOTE</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {detailwork.data.map((worker) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
                        key={worker.id}
                      >
                        <td className="px-3 py-2">{worker.task}</td>
                        <td className="px-3 py-2">{worker.id}</td>
                        <th className="px-3 py-2 text-white ">
                          <p className="text-black hover:text-indigo-600">
                            <Link href={route("worker.show", worker.worker_id)}>
                              {worker.name}
                            </Link>
                          </p>
                        </th>
                        <td className="px-3 py-2">{worker.code}</td>
                        <td className="px-3 py-2">{worker.hours}</td>
                        {/* <td className="px-3 py-2">{worker.note}</td> */}
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

  /* return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-blue-500 dark:text-gray-200 leading-tight">
            <Link
              href={route("client.show", client_id)}
              className=" py-1 px-3 text-blue-500 transition-all"
            >
              {client}
            </Link>
            {`> ${work.name} > Tasks`}
          </h2>

          <Link
            href={route("task.create")}
            className="bg-emerald-200 py-1 px-3 text-emerald-500 rounded shadow transition-all hover:bg-emerald-400 hover:text-white"
          >
            Stampa
          </Link>
        </div>
      }
    >
      <Head title="Lavori" />

      {print && (
        <div className="bg-orange-500 py-2 px-4 text-white rounded">
          {print}
        </div>
      )}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
             
              <p>TASK</p>

              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <table className="w-full text-left text-sm rtl:text-right text-gray-900 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase">
                      <tr className="text-nowrap px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        <td>CODICE</td>
                        <td>NOME</td>
                        <td>ORE</td>
                        <td>PREZZI</td>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.data.map((task) => (
                        <tr className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100">
                          <td>{task.code}</td>
                          <td>{task.name}</td>
                          <td>{task.hours}</td>
                          <td>{task.priece}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                  <p>MATERIALI</p>
                  <table className="w-full text-left text-sm rtl:text-right text-gray-900 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase">
                      <tr className="text-nowrap px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        <td>CODE</td>
                        <td>MATERIALI</td>
                        <td>PREZZI</td>
                      </tr>
                    </thead>
                    <tbody>
                      {detailmaterial.data.map((detailmat) => (
                        <tr className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100">
                          <td>{detailmat.code}</td>
                          <td>{detailmat.materials}</td>
                          <td>{detailmat.priece}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>

              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <p>OPERAI</p>
                  <table className="w-full text-left text-sm rtl:text-right text-gray-900 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase">
                      <tr className="text-nowrap px-3 py-2 flex items-center justify-between gap-1 cursor-pointer">
                        <td>CODE</td>

                        <td>NOME</td>

                        <td>ORE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {detailwork.data.map((detailw) => (
                        <tr className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100">
                          <td>{detailw.worker_id}</td>
                          <td>{detailw.name}</td>
                          <td>{detailw.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  ); */
}
