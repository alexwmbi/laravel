
export default function WorkersTable({ workersdetails }){

  
   return(

        <>
            <dir className="overflow-auto">
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">NOME</th>
                      <th className="px-3 py-2">CODICE</th>
                      <th className="px-3 py-2">ORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workersdetails.map((worker) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                        key={worker.id}
                      >
                        <td className="px-3 py-2">{worker.id}</td>
                        <td className="px-3 py-2">{worker.name}</td>
                        <td className="px-3 py-2">{worker.code}</td>
                        <td className="px-3 py-2">ore</td>
                

                      
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dir>
        </>
    )
}