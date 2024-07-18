
export default function MaterialsDetailsTable({materialsdetails }){

  
    return(
 
         <>
             <dir className="overflow-auto">
                 <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                   <thead className="text-xs text-gray-700 uppercase">
                     <tr className="text-nowrap">
                     {/* 'name', 'code' , 'material_id' , 'priece' , 
                     'aug', 'iva', 'tot' ,'client' , 'work' , 
                     'task' , 'note' , 'status' ,'starting_date','end_date'  */}
                       <th className="px-3 py-2">ID</th>
                       <th className="px-3 py-2">DESCRIZIONE</th>
                       <th className="px-3 py-2">CODICE ARTICOLO</th>
                       <th className="px-3 py-2">PREZZO</th>
                       <th className="px-3 py-2">UM</th>
                       <th className="px-3 py-2">QUANTITA</th>
                       <th className="px-3 py-2">AZIONI</th>
                      
                       
                     </tr>
                   </thead>
                   <tbody>
                   {/* <pre>{JSON.stringify(materialsdetails,undefined, 2)}</pre>  */}
                     {materialsdetails.map((material) => (
                       <tr
                         className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                         key={material.id}
                       >
                         <td className="px-3 py-2">{material.id}</td>
                         <td className="px-3 py-2">{material.name}</td>
                         <td className="px-3 py-2">{material.code}</td>
                         <td className="px-3 py-2">{material.priece}</td>
                         <td className="px-3 py-2">{material.um}</td>
                         <td className="px-3 py-2">{material.quantity}</td>
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
     )
 }