export default function WorkersDetailsTable({ workers }) {
  return (
    <>
     {/* <pre>{JSON.stringify(workers,undefined, 2)}</pre>  */}
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              {/*  'name', 'code' , 'worker_id' , 'hours' , 'client' , 'work' ,
              'task' , 'note' , 'status' ,'starting_date','end_date'; */}
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">NOME</th>
              <th className="px-3 py-2">CODICE</th>
              <th className="px-3 py-2">ORE</th>
              <th className="px-3 py-2">NOTE</th>
              <th className="px-3 py-2">AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                key={worker.id}
              >
                <td className="px-3 py-2">{worker.worker_id}</td>
                <td className="px-3 py-2">{worker.name}</td>
                <td className="px-3 py-2">{worker.code}</td>
                <td className="px-3 py-2">{worker.hours}</td>
                <td className="px-3 py-2">{worker.note}</td>
                <td className="px-3 py-2 text-nowrap">
                       Modifica
                       Elimina
                       
                      </td>
              </tr>
            ))}
          </tbody>
        </table>
      </dir>
    </>
  );
}
