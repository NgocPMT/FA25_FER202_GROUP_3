import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function PublicationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [pub, setPub] = useState({
    name: "",
    bio: "",
    avatarUrl: null,
  });

  const [saving, setSaving] = useState(false);

  // ❗ MOVE THIS INSIDE COMPONENT
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    checkOwner();
    loadPublication();
  }, []);

  // CHECK OWNER
  const checkOwner = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/validate-owner/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      toast.error("Failed to verify owner!");
      navigate(`/publications/${id}`);
      return;
    }

    const data = await res.json();

    if (!data?.isOwner) {
      toast.error("❌ You are NOT the owner — cannot edit!");
      navigate(`/publications/${id}`);
    }
  };

  // LOAD PUBLICATION
  const loadPublication = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications?page=1&limit=200`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    const item =
      Array.isArray(data)
        ? data.find((x) => x.id === Number(id))
        : data?.publications?.find((x) => x.id === Number(id));

    if (item) {
      setPub({
        name: item.name,
        bio: item.bio || "",
        avatarUrl: item.avatarUrl || null,
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/images/upload-avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      const data = await res.json();
      setPub((prev) => ({ ...prev, avatarUrl: data.url }));
      toast.info("Image uploaded!");
    } catch {
      toast.error("Upload failed!");
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/publications/${id}`,
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

    if (!res.ok) {
      toast.error("❌ Update failed!");
      return;
    }

    toast.success("✔ Updated successfully!");
    navigate(`/publications/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Edit Publication</h1>

      <div className="bg-white shadow-md rounded-2xl p-8 space-y-10">
        <div className="flex gap-10 items-start">
          <div className="relative group">
            {pub.avatarUrl ? (
              <img
                src={pub.avatarUrl}
                className="w-40 h-40 object-cover rounded-xl shadow-md"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-xl shadow-md text-gray-500">
                <RxAvatar size={70} />
              </div>
            )}

            <label className="absolute inset-0 bg-black bg-opacity-40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-xs transition">
              Change Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <label className="block font-medium mb-1">Publication Name</label>
              <input
                value={pub.name}
                onChange={(e) => setPub({ ...pub, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Bio</label>
              <textarea
                value={pub.bio}
                onChange={(e) => setPub({ ...pub, bio: e.target.value })}
                rows="4"
                className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md ${
              saving
                ? "bg-gray-400 cursor-default"
                : "bg-black text-white hover:opacity-80"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
