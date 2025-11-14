import { NavLink, Outlet } from "react-router-dom";

export default function Following() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">Follows</h1>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-10">
        <NavLink
          to="/following/followings"
          className={({ isActive }) =>
            `px-5 py-2.5 rounded-full text-sm font-medium border transition ${
              isActive
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Following
        </NavLink>

        <NavLink
          to="/following/followers"
          className={({ isActive }) =>
            `px-5 py-2.5 rounded-full text-sm font-medium border transition ${
              isActive
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Followers
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}
