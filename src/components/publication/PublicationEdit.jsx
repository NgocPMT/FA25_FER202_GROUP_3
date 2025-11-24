import { useEffect, useState } from "react";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";

export default function PublicationEdit({ publicationId, onClose }) {
  const token = localStorage.getItem("token");

  const [pub, setPub] = useState({ name: "", bio: "", avatarUrl: null });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPublication();
  }, [publicationId]);

  const loadPublication = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/publications/${publicationId}`);
    const data = await res.json();
    setPub({
      name: data.name,
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || null
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/images/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      setUploading(false);

      if (!data.url) return toast.error("Upload failed!");
      setPub((prev) => ({ ...prev, avatarUrl: data.url }));

      toast.success("Avatar updated!");
    } catch {
      toast.error("Upload failed!");
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications/${publicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pub),
      }
    );

    setSaving(false);

    if (!res.ok) return toast.error("Failed to update");

    toast.success("Updated!");
    onClose(); // đóng popup
    window.location.reload(); // refresh lại detail
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-semibold mb-6">Edit Publication</h2>

      <div className="flex gap-10 items-start">
        {/* Avatar */}
        <label className="relative group cursor-pointer">
          {pub.avatarUrl ? (
            <img
              src={pub.avatarUrl}
              className="w-32 h-32 object-cover rounded-xl shadow-md"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-xl shadow-md text-gray-500">
              <RxAvatar size={70} />
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center text-sm rounded-xl transition">
            {uploading ? "Uploading..." : "Change Avatar"}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>

        <div className="flex-1 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={pub.name}
              onChange={(e) => setPub({ ...pub, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={pub.bio}
              onChange={(e) => setPub({ ...pub, bio: e.target.value })}
              rows="4"
              className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-right mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-semibold shadow-md ${
            saving
              ? "bg-gray-400 cursor-default"
              : "bg-black text-white hover:bg-opacity-80"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
