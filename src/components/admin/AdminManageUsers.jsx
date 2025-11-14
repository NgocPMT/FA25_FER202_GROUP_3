import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  // ================================
  // HANDLE SELECT CHANGE (ACTIVE)
  // ================================
  const handleChangeStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");

    const url =
      newStatus === "active"
        ? `/admin/users/user/${id}/activate`
        : `/admin/users/user/${id}/deactivate`;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to update status");
        return;
      }

      // Update UI
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: newStatus === "active" } : u
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">User ID</th>
              <th className="p-3 border">Username</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Active</th>
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
                <tr key={u.id} className="border">
                  <td className="p-3 border">{u.id}</td>
                  <td className="p-3 border">{u.username}</td>
                  <td className="p-3 border">{u.email}</td>

                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        u.role === "ADMIN"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {u.role || "USER"}
                    </span>
                  </td>

                  {/* SELECT ACTIVE / INACTIVE */}
                  <td className="p-3 border">
                    <select
                      value={u.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        handleChangeStatus(u.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
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
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-4 mt-6 justify-center items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 border rounded ${
            page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 border rounded ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
