import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";

export default function WorksTable({works, client, queryParams }){

    return(

        <>
            <dir className="overflow-auto">
                <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">NAME</th>
                      <th className="px-3 py-2">STATO</th>
                      <th className="px-3 py-2">MODIFICA</th>
                    </tr>
                  </thead>
                  <thead className="text-xs text-gray-700 uppercase">
                    <tr className="text-nowrap">
                      <th className="px-3 py-2"></th>
                      <th className="px-3 py-2">
                        <TextInput
                          className="w-full"
                          defaultValue={queryParams.name}
                          placeholder="Nome Lavoro"
                          onBlur={(e) =>
                            searchFieldChanged("name", e.targed.value)
                          }
                          onKeyPress={(e) => onKeyPress("name", e)}
                        />
                      </th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.data.map((work) => (
                      <tr
                        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                        key={work.id}
                      >
                        <td className="px-3 py-2">{work.id}</td>
                        <th className="px-3 py-2 text-white hover:underline">
                          <Link href={route("work.show", work.id)}>
                              {work.name}
                          </Link>
                        </th>

                        <td className="px-3 py-2">{work.status}</td>
                        <td className="px-3 py-2">{client.name}</td>

                        <td className="px-3 py-2 text-nowrap">
                          <Link href={route("work.edit", work.id)}>
                            Modifica
                          </Link>
                          <Link
                            className="px-2"
                            href={route("work.destroy", work.id)}
                          >
                            Elimina
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dir>
        </>
    )
}