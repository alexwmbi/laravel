import { WORK_STATUS_CLASS_MAP, WORK_STATUS_TEXT_MAP } from "@/constants.jsx";
import { Link, router } from "@inertiajs/react";

export default function WorkerTasksTable({ taskworker }) {
  return taskworker.map((work) => (
    <>
      <tr
        className="bg-white border-b dark:bg-gray-700 dark:border-gray-700 hover:bg-purple-100"
        key={work.id}
      >
        {/* <td className="px-3 py-2">{work.id}</td> */}
        <th className="px-3 py-2 text-white ">
          <p className="text-black hover:text-indigo-600">
            <Link href={route("task.show", work.id)}>{work.name}</Link>
          </p>
        </th>

        <td className="px-3 py-2">{work.category}</td>
        <td className="px-3 py-2">{work.work_id}</td>
        <td className="px-3 py-2">{work.hours}</td>
        <td className="px-3 py-2">{work.description}</td>
        <td className="px-3 py-2">{work.note}</td>
        <td className="px-3 py-2">{work.starting_date}</td>
        <td className="px-3 py-2">{work.due_date}</td>
      </tr>
    </>
  ));
}
