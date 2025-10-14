import { useState } from "react";
import { Menu, Bell, Pen, Search, X } from "lucide-react";
import { Link } from "react-router";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Thanh trên cùng */}
      <div className="flex items-center justify-between flex-wrap px-4 py-3 w-full min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>

          <Link
            to="/"
            className="font-lora font-bold text-2xl text-gray-900 truncate"
          >
            Easium
          </Link>
        </div>

        {/* CENTER (search input khi >=727px) */}
        <div className="hidden [@media(min-width:727px)]:flex justify-center flex-1 min-w-0 px-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full max-w-xs border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 [@media(max-width:900px)]:max-w-[200px]"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <button className="hidden [@media(min-width:727px)]:flex items-center gap-1 px-3 py-1 border rounded-full text-sm hover:bg-gray-100">
            <Pen className="w-4 h-4" />
            <span>Write</span>
          </button>

          <button className="hidden [@media(min-width:727px)]:block p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-full hover:bg-gray-100 [@media(min-width:727px)]:hidden"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold cursor-pointer flex-shrink-0 overflow-hidden">
            A
          </div>
        </div>
      </div>

      {/* Thanh search trượt xuống khi showSearch = true (chỉ hiện khi <727px) */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t [@media(min-width:727px)]:hidden ${
          showSearch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showSearch && (
          <div className="px-4 py-3 bg-white">
            <input
              type="text"
              placeholder="Search Easium..."
              autoFocus
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
