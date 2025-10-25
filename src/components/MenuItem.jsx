import { Link } from "react-router";

const MenuItem = ({ icon, activeIcon, label, href, active }) => {
  return (
    <li className="relative group flex items-center gap-4 pl-4 pr-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-all">
      <span
        className={`absolute top-0 -left-3.5 h-full w-0.5 rounded-r transition-colors ${
          active ? "bg-gray-800" : "bg-transparent"
        }`}
      ></span>

      <span
        className={`text-xl transition-colors ${
          active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
        }`}
      >
        {active ? activeIcon : icon}
      </span>

      <Link
        to={href}
        className={`flex-1 transition-colors duration-150 ${
          active
            ? "text-gray-900 font-medium"
            : "text-gray-500 group-hover:text-gray-800"
        }`}
      >
        {label}
      </Link>
    </li>
  );
};

export default MenuItem;
