import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const itemClasses = (active) =>
    `p-2 rounded transition 
     ${
       active
         ? "bg-gray-100 text-gray-900"
         : "text-gray-600 hover:text-gray-700"
     }`;

  return (
    <div className="w-64 bg-white border-r border-gray-300 h-screen p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

      <Link
        to="/admin/reports"
        className={itemClasses(pathname.includes("reports"))}
      >
        Articles Report
      </Link>

      <Link
        to="/admin/users"
        className={itemClasses(pathname.includes("users"))}
      >
        Manage Users
      </Link>

      <Link
        to="/admin/topics"
        className={itemClasses(pathname.includes("topics"))}
      >
        Manage Topics
      </Link>

      <Link
        to="/admin/reactions"
        className={itemClasses(pathname.includes("reactions"))}
      >
        Manage Reactions
      </Link>
    </div>
  );
}
