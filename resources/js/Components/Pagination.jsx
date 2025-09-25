import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
  return (
    <nav className="text-center mt-4">
      {links.map((link) => (
        <Link
          preserveScroll
          href={link.url || ""}
          key={link.label}
          dangerouslySetInnerHTML={{ __html: link.label }}
          className={
            "inline-block py-2 px-3 text-gray-500 text-xs " +
            (link.active ? "bg-blue-500 text-white rounded " : " ") +
            (!link.url
              ? "!text-gray-600 cursor-not-allowed "
              : "hover:bg-blue-400 hover:text-white ")
          }
        ></Link>
      ))}
    </nav>
  );
}
