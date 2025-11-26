import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Navbar Admin */}
      <div className="fixed top-0 left-0 right-0 h-14 z-50">
        <AdminNavbar />
      </div>

      {/* Sidebar Admin */}
      <div className="fixed top-14 left-0 h-[calc(100vh-56px)] w-64 bg-white shadow-lg z-40">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 ml-64 pt-16 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
