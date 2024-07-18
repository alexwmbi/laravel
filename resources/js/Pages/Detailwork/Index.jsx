import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ auth, workers, taskid }) {

    
  const [selectedItems, setSelectedItems] = useState([]);

  function strcreate(selectedItems){
    return (
      selectedItems
    );
  }

    const { data, setData, post  } = useForm(strcreate()
     
    );

  
  //const [isChecked, setIsChecked] = useState( false);
  /*  const [checked, setChecked] = useState(false);

  const [state, setState] = useState({
    hooks: false
  }) */

 

  function checkboxHandler(e) {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value);

    if (isSelected) {
      setSelectedItems([...selectedItems, value]);
    } else {
      setSelectedItems((prevData) => {
        return prevData.filter((id) => {
          return id !== value;
        });
      });
    }
  }


  function hoursHandler (e) {
    let hoursValue = parseInt(e.target.value);
    //console.log(hoursValue);
    let idValue = e.target.id;
    //console.log(idValue);

  }

  function hoursGetter(selectedItems){
    
    let hoursValue = parseInt(getElementById());
   
    console.log(intArr);
    let idValue = e.target.id;

  }

  const onSubmit = (e) => {
    //hoursGetter(selectedItems);
   

    //console.log(idValue,hoursValue);

    e.preventDefault();

    post(route("detailwork.store"));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Aggiungi Operaio
          </h2>
        </div>
      }
    >
      <Head title="Aggiungi Operaio" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <form
                onSubmit={onSubmit}
                className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg"
              >
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap">
                      <th className="px-3 py-2">SELEZIONA</th>
                      <th className="px-3 py-2">NOME</th>
                      <th className="px-3 py-2">ORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.data.map((worker, index) => (
                      
                      <tr key={index}>
                        <td>
                          <Checkbox
                            checked={selectedItems.includes(worker.id)}
                            value={worker.id}
                            onChange={checkboxHandler}
                          />
                        </td>
                        <td>
                          <h1>{worker.name}</h1>
                        </td>
                        <td>
                          <TextInput
                            id={"hours"+worker.id}
                            type="text"
                            name={"hours"+worker.id}
                            
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData("hours"+worker.id, e.target.value)}

                             
                          />
                           {/* <pre>{JSON.stringify(data.hours[worker.id],undefined, 2)}</pre>  */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                <Link
                  href={route("task.show",taskid)}
                  className="bg-gray-100 py-1 px-3 text-gray-800 rounded shadow transition-all hover:bg-gray-200 mr-2"
                >
                  Annulla
                </Link>
                <button className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600">
                  OK
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
