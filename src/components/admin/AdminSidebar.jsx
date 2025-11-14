import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <div className="w-64 bg-white border-r h-screen p-4 flex flex-col gap-4">

      <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

      <Link
        to="/admin/reports"
        className={`p-2 rounded ${pathname.includes("reports") ? "bg-gray-200 font-semibold" : ""}`}
      >
        Articles Report
      </Link>

      <Link
        to="/admin/users"
        className={`p-2 rounded ${pathname.includes("users") ? "bg-gray-200 font-semibold" : ""}`}
      >
        Manage Users
      </Link>

    </div>
  );
}
