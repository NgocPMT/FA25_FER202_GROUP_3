import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminManageTopic() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);

  // Fetch topics
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

  // Create new topic
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

  // Update topic
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

  // Delete topic
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

      {/* Search */}
      <input
        type="text"
        placeholder="Search topics..."
        className="border px-3 py-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Create / Edit Form */}
      <form
        onSubmit={editingTopic ? handleUpdate : handleCreate}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Topic name..."
          className="border px-3 py-2 rounded flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {editingTopic ? "Update" : "Create"}
        </button>

        {editingTopic && (
          <button
            type="button"
            onClick={() => {
              setEditingTopic(null);
              setName("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
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
              <th className="p-2 font-semibold border-b border-gray-300 text-left">
                Slug
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
                <td className="p-2 border-b border-gray-300 text-gray-500">
                  {topic.slug}
                </td>

                <td className="p-2 border-b border-gray-300">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => {
                        setEditingTopic(topic);
                        setName(topic.name);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDelete(topic.id)}
                    >
                      Delete
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
