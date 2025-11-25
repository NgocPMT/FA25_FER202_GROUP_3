import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function AdminManageReactions() {
  const [reactions, setReactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedReaction, setSelectedReaction] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchReactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setReactions(data || []);
    } catch (err) {
      console.error("Error fetching reactions:", err);
      toast.error("Failed to fetch reactions");
    }
  };

  useEffect(() => {
    fetchReactions();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedReaction(null);
    setName("");
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (reaction) => {
    setModalMode("edit");
    setSelectedReaction(reaction);
    setName(reaction.name);
    setImageFile(null);
    setImagePreview(reaction.reactionImageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReaction(null);
    setName("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const form = new FormData();
    form.append("file", imageFile);

    try {
      const token = localStorage.getItem("token");
      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL}/images/upload-reaction`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData?.error || "Upload image failed!");
        throw new Error("Failed to upload image");
      }

      return uploadData.url;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Reaction name is required");
      return;
    }

    if (modalMode === "create" && !imageFile) {
      toast.error("Reaction image is required");
      return;
    }

    setIsUploading(true);

    try {
      let reactionImageUrl = imagePreview;

      // Upload new image if file is selected
      if (imageFile) {
        reactionImageUrl = await uploadImage();
        if (!reactionImageUrl) {
          setIsUploading(false);
          return;
        }
      }

      const token = localStorage.getItem("token");
      const url =
        modalMode === "create"
          ? `${import.meta.env.VITE_API_URL}/reactions`
          : `${import.meta.env.VITE_API_URL}/reactions/${selectedReaction.id}`;

      const method = modalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          reactionImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Operation failed");
        setIsUploading(false);
        return;
      }

      toast.success(data.message);
      closeModal();
      fetchReactions();
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reactionId) => {
    if (!confirm("Are you sure you want to delete this reaction?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reactions/${reactionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete reaction");
        return;
      }

      toast.success(data.message);
      fetchReactions();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete reaction. Please try again.");
    }
  };

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReactions = reactions.slice(startIndex, endIndex);
  const hasNext = endIndex < reactions.length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reaction Management</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <FiPlus size={18} />
          Add Reaction
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Usages</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {paginatedReactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No reactions found.
                </td>
              </tr>
            ) : (
              paginatedReactions.map((reaction) => (
                <tr key={reaction.id} className="border hover:bg-gray-50">
                  <td className="p-3 border text-center">{reaction.id}</td>
                  <td className="p-3 border text-center font-medium">
                    {reaction.name}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center">
                      <img
                        src={reaction.reactionImageUrl}
                        alt={reaction.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  </td>
                  <td className="p-3 border text-center">
                    {reaction._count.PostReaction}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(reaction)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        title="Edit reaction"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reaction.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        title="Delete reaction"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1 opacity-70">{page}</span>

          <button
            disabled={!hasNext}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "create" ? "Create Reaction" : "Edit Reaction"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div>
              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reaction Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Love, Laugh, Angry"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Reaction Image{" "}
                  {modalMode === "create" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
