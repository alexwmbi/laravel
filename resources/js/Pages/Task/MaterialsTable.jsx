export default function MaterialsTable({ materials }) {
  return (
    <>
      <dir className="overflow-auto">
        <table className="w-full text-left text-sm rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase">
            <tr className="text-nowrap">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">CODICE ARTICOLO</th>
              <th className="px-3 py-2">CODICE PRODOTTO</th>
              <th className="px-3 py-2">NOME PRODOTTO</th>
              <th className="px-3 py-2">DESCRIZIONE</th>
              <th className="px-3 py-2">UM</th>
              <th className="px-3 py-2">PREZZO</th>
              <th className="px-3 py-2">IVA</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr
                className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 "
                key={material.id}
              >
                <td className="px-3 py-2">{material.id}</td>
                <td className="px-3 py-2">{material.cod_art}</td>
                <td className="px-3 py-2">{material.cod_prod}</td>
                <td className="px-3 py-2">{material.name_prod}</td>
                <td className="px-3 py-2">{material.desc}</td>
                <td className="px-3 py-2">{material.um}</td>
                <td className="px-3 py-2">{material.priece}</td>
                <td className="px-3 py-2">{material.iva}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </dir>
    </>
  );
}
