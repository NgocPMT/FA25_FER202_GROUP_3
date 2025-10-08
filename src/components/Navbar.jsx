import { Link } from "react-router-dom";
import { Menu, Bell, Pen } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex justify-between items-center px-5 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar button */}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-lora font-bold text-2xl sm:text-3xl text-gray-900"
          >
            Easium
          </Link>

          {/* Search box */}
          <div className="hidden sm:block">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Write button */}
          <button className="flex items-center gap-1 px-3 py-1 border rounded-full text-sm hover:bg-gray-100">
            <Pen className="w-4 h-4" />
            <span className="hidden sm:inline">Write</span>
          </button>

          {/* Notification */}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button>

          {/* Avatar (sau này có thể đổi thành ảnh user) */}
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold cursor-pointer">
            A
          </div>

          {/* Auth buttons */}
          <Link
            to="/sign-in"
            className="hidden sm:inline text-sm text-gray-700 hover:underline"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="text-sm px-3 py-1 bg-black text-white rounded-full hover:opacity-80 transition"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;