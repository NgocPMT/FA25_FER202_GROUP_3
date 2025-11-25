import { useEffect, useState } from "react";
import { BsPencil, BsTrash } from "react-icons/bs";
import { Link } from "react-router-dom";

const Library = () => {
  const token = localStorage.getItem("token");

  const [readlist, setReadlist] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [loading, setLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingList, setDeletingList] = useState(null);
  const [pagedReadlist, setPagedReadlist] = useState([]);

  useEffect(() => {
    getReadlist();
  }, [])

  useEffect(() => {
    const start = (page - 1) * limit;
    const end = page * limit;
    setPagedReadlist(readlist.slice(start, end));
  }, [page, readlist]);

  async function getReadlist() {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/reading-lists`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to get readlist");
      }

      const data = await res.json();

      setReadlist(data);
      console.log("data: ", data);
      const paginated = data.slice((page - 1) * limit, page * limit);
      setPagedReadlist(paginated);
    } catch (err) {
      console.log("Failed to get readlist:", err.message);
    }

    setLoading(false);
  }

  async function createReadingList() {
    if (!newListName.trim()) return alert("Name is required!");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me/reading-lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newListName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create reading list");
      }

      await getReadlist();

      setCreateModal(false);
      setNewListName("");
    } catch (err) {
      console.log("error create reading list: ", err.message);
    }
  }

  async function updateReadingList() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/reading-lists/${editingList.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editName }),
        }
      );

      console.log(editingList);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update list");
      }

      await getReadlist();

      setEditModal(false);
    } catch (err) {
      console.log("error edit reading list: ", err.message);
    }
  }

  async function deleteReadingList(id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/reading-lists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }

      await getReadlist();

    } catch (err) {
      console.log("error delete reading list: ", err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-20 container">
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 pb-2">Your Library</h1>
        <button
          onClick={() => setCreateModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg">New Reading List
        </button>
        {createModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Create New Reading List</h2>
              <input
                type="text"
                className="border w-full p-2 rounded mb-4"
                placeholder="Enter list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={createReadingList}
                  className="px-4 py-2 rounded bg-black text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {pagedReadlist.length === 0 && !loading ? (
          <p className="text-gray-500 italic">Your library is empty.</p>
        ) : (
          pagedReadlist.map((list) => (
            <Link
              to={`/library/${list.id}`}
              key={list.id}
              className="flex w-full rounded-xl bg-gray-200 cursor-pointer hover:opacity-90 transition items-stretch"
            >
              <div className="flex flex-col justify-center flex-[4] p-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                    {list.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingList(list);
                        setEditName(list.name);
                        setEditModal(true);
                      }}
                      className="p-1 cursor-pointer hover:bg-green-200 rounded transition"
                      title="Edit list"
                    >
                      <BsPencil />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingList(list);
                        setDeleteModal(true);
                      }}
                      className="p-1 cursor-pointer hover:bg-red-200 rounded transition"
                      title="Delete list"
                    >
                      <BsTrash />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}

        {loading && (
          <p className="text-gray-400 text-center mt-4">Loading...</p>
        )}
      </div>
      {/* Pagination */}
      {readlist.length > 0 && (
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1 rounded-full bg-white transition ${page === 1 ? "invisible" : "cursor-pointer opacity-40 hover:opacity-60"
              }`}
          >
            Prev
          </button>
          <span className="px-3 py-1 opacity-70">{page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded-full bg-white transition ${page * limit >= readlist.length
              ? "invisible"
              : "cursor-pointer opacity-40 hover:opacity-60"
              }`}
          >
            Next
          </button>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Reading List</h2>
            <input
              type="text"
              className="border w-full p-2 rounded mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={updateReadingList}
                className="px-4 py-2 rounded bg-black text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-2">Delete this reading list?</h2>
            <p className="text-gray-700 mb-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
              "{deletingList?.name}"
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteReadingList(deletingList.id);
                  setDeleteModal(false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
