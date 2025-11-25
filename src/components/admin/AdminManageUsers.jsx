import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [hasNext, setHasNext] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("userSearchHistory") || "[]")
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchUsers = async () => {
    try {
      let url = `${
        import.meta.env.VITE_API_URL
      }/admin/users?page=${page}&limit=${limit}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      setUsers(data.users || []);
      setHasNext(data.users.length === limit);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  // Save search history
  const saveSearchHistory = (username) => {
    const updated = [
      username,
      ...searchHistory.filter((x) => x !== username),
    ].slice(0, 5);
    localStorage.setItem("userSearchHistory", JSON.stringify(updated));
    setSearchHistory(updated);
  };

  const removeHistoryItem = (username) => {
    const updated = searchHistory.filter((x) => x !== username);
    localStorage.setItem("userSearchHistory", JSON.stringify(updated));
    setSearchHistory(updated);
  };

  const clearAllHistory = () => {
    localStorage.removeItem("userSearchHistory");
    setSearchHistory([]);
  };

  // Apply search
  const applySearch = () => {
    if (searchInput.trim() === "") {
      setSearch("");
      return;
    }
    setSearch(searchInput.trim());
    saveSearchHistory(searchInput.trim());
    setShowDropdown(false);
    setPage(1);
  };

  const handleSearchKeyDown = (e) => e.key === "Enter" && applySearch();

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // Handle activate/deactivate
  const handleChangeStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    const url =
      newStatus === "active"
        ? `${import.meta.env.VITE_API_URL}/admin/users/user/${id}/activate`
        : `${import.meta.env.VITE_API_URL}/admin/users/user/${id}/deactivate`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }

      // Update UI
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: newStatus === "active" } : u
        )
      );

      toast.success(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by username"
            className="w-full border border-gray-300 bg-gray-50 rounded-full px-4 py-2 text-sm
         focus:outline-none focus:ring-2 focus:ring-cyan-100"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onKeyDown={handleSearchKeyDown}
          />

          {/* Search button */}
          <button
            onClick={applySearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
          >
            <IoSearchOutline size={18} />
          </button>

          {/* History dropdown */}
          {showDropdown &&
            searchHistory.length > 0 &&
            searchInput.trim() === "" && (
              <div className="absolute top-11 bg-white border rounded shadow w-full z-20 max-h-60 overflow-auto">
                <div className="flex justify-between px-3 py-1 text-xs text-gray-500">
                  History
                  <button
                    onClick={clearAllHistory}
                    className="text-red-500 hover:underline"
                  >
                    Delete All
                  </button>
                </div>

                {searchHistory.map((username, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 flex justify-between hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchInput(username);
                      setSearch(username);
                      setPage(1);
                      saveSearchHistory(username);
                      setShowDropdown(false);
                    }}
                  >
                    {username}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(username);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Clear button */}
        {(search || searchInput) && (
          <button
            onClick={clearSearch}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-xl overflow-hidden mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 font-semibold border border-gray-300 text-center">
                User ID
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-left">
                Username
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-left">
                Email
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-center">
                Role
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-center">
                Status
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-center">
                Created At
              </th>
              <th className="p-3 font-semibold border border-gray-300 text-center w-[150px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-4 text-gray-500 border border-gray-300"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-300 text-center">
                    {u.id}
                  </td>

                  <td className="p-3 border border-gray-300 font-medium">
                    {u.username}
                  </td>

                  <td className="p-3 border border-gray-300">{u.email}</td>

                  <td className="p-3 border border-gray-300 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {u.role || "USER"}
                    </span>
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    <select
                      value={u.isActive ? "active" : "inactive"}
                      onChange={(e) => handleChangeStatus(u.id, e.target.value)}
                      className={`border rounded px-2 py-1 text-sm  ${
                        u.isActive
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      <option value="active" style={{ color: "#16A34A" }}>
                        Active
                      </option>

                      <option value="inactive" style={{ color: "#DC2626" }}>
                        Inactive
                      </option>
                    </select>
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    <Link
                      to={`/profile/${u.username}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded-full bg-white transition ${
            page === 1
              ? "invisible"
              : "cursor-pointer opacity-40 hover:opacity-60"
          }`}
        >
          Prev
        </button>

        <span className="px-3 py-1 opacity-70">{page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className={`px-3 py-1 rounded-full bg-white transition ${
            !hasNext
              ? "invisible"
              : "cursor-pointer opacity-40 hover:opacity-60"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
