import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

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
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const totalPages = Math.ceil(total / limit);

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

      {/* Limit selector */}
      <select
        value={limit}
        onChange={(e) => {
          setPage(1);
          setLimit(Number(e.target.value));
        }}
        className="border rounded px-3 py-1 mb-4"
      >
        <option value="5">5 / page</option>
        <option value="10">10 / page</option>
        <option value="20">20 / page</option>
        <option value="50">50 / page</option>
      </select>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 border flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by username"
            className="w-full border bg-gray-50 rounded-full pl-10 pr-8 py-2 text-sm
             focus:outline-none focus:ring-0 focus:border-gray-300"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onKeyDown={handleSearchKeyDown}
          />

          {/* Search button */}
          <button
            onClick={applySearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
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
            className="px-4 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">User ID</th>
              <th className="p-3 border">Username</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Created At</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border hover:bg-gray-50">
                  <td className="p-3 border">{u.id}</td>
                  <td className="p-3 border font-medium">{u.username}</td>
                  <td className="p-3 border">{u.email}</td>

                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {u.role || "USER"}
                    </span>
                  </td>

                  {/* Status select */}
                  <td className="p-3 border">
                    <select
                      value={u.isActive ? "active" : "inactive"}
                      onChange={(e) => handleChangeStatus(u.id, e.target.value)}
                      className={`border rounded px-2 py-1 text-sm font-medium ${
                        u.isActive
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>

                  <td className="p-3 border">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="p-3 border text-center">
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
      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>

          {totalPages > 0 &&
            [...Array(Math.min(totalPages, 10))].map((_, i) => {
              const pageNum = i + 1;
              // Show first 3, last 3, and current page with neighbors
              const showPage =
                pageNum <= 3 ||
                pageNum > totalPages - 3 ||
                (pageNum >= page - 1 && pageNum <= page + 1);

              if (!showPage) {
                if (pageNum === 4 && page > 5)
                  return (
                    <span key={i} className="px-2">
                      ...
                    </span>
                  );
                if (pageNum === totalPages - 3 && page < totalPages - 4)
                  return (
                    <span key={i} className="px-2">
                      ...
                    </span>
                  );
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 border rounded ${
                    page === pageNum
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="text-center mt-4 text-sm text-gray-600">
        Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
        {Math.min(page * limit, total)} of {total} users
      </div>
    </div>
  );
}
