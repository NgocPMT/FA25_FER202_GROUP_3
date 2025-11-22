import { useEffect, useState } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminManageTopic() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/topics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("TOPICS DATA:", res.data);
      setTopics(res.data);
    } catch (err) {
      console.error("Error fetching topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await axios.post(
        `${API_URL}/topics`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setName("");
      fetchTopics();
    } catch (err) {
      console.error("Error creating topic:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await axios.put(
        `${API_URL}/topics/${editingTopic.id}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEditingTopic(null);
      setName("");
      fetchTopics();
    } catch (err) {
      console.error("Error updating topic:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await axios.delete(`${API_URL}/topics/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchTopics();
    } catch (err) {
      console.error("Error deleting topic:", err);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Manage Topics</h1>

      <div className="flex items-center gap-4 mb-6">
        {/* SEARCH BOX WITH ICON */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search topics..."
            className="border border-gray-300 px-3 py-2 rounded-lg w-full pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
            />
          </svg>
        </div>

        <form
          onSubmit={editingTopic ? handleUpdate : handleCreate}
          className="flex items-center gap-2 w-full"
        >
          <input
            type="text"
            placeholder="Topic name..."
            className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            type="submit"
            className="px-4 py-2 border border-emerald-300 text-emerald-400 rounded whitespace-nowrap cursor-pointer
             flex items-center gap-2"
          >
            {editingTopic ? <FiEdit size={18} /> : <FiPlus size={18} />}

            {editingTopic ? "Update" : "Create"}
          </button>

          {editingTopic && (
            <button
              type="button"
              onClick={() => {
                setEditingTopic(null);
                setName("");
              }}
              className="px-4 py-2 border border-gray-400 text-gray-500 rounded whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : topics.length === 0 ? (
        <p>No topics found.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 font-semibold border-b border-gray-300 w-20 text-left rounded-tl-xl">
                ID
              </th>
              <th className="p-2 font-semibold border-b border-gray-300 text-left">
                Name
              </th>
              <th className="p-2 font-semibold border-b border-gray-300 w-[180px] text-left rounded-tr-xl">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="p-2 border-b border-gray-300">{topic.id}</td>

                <td className="p-2 border-b border-gray-300">{topic.name}</td>

                <td className="p-2 border-b border-gray-300">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 border border-indigo-300 text-indigo-400 rounded cursor-pointer"
                      onClick={() => {
                        setEditingTopic(topic);
                        setName(topic.name);
                      }}
                    >
                      <FiEdit size={16} />
                    </button>

                    <button
                      className="px-3 py-1 border border-red-300 text-red-400 rounded cursor-pointer"
                      onClick={() => handleDelete(topic.id)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
