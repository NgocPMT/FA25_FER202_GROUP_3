import { RxAvatar } from "react-icons/rx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PublicationCreate() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    try {
      if (!name.trim()) {
        toast.error("Publication name cannot be empty!");
        return;
      }

      let avatarUrl = null;

      if (avatarFile) {
        const form = new FormData();
        form.append("file", avatarFile);

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL}/images/upload-avatar`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          }
        );

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          toast.error(uploadData?.error || "Upload image failed!");
          return;
        }

        avatarUrl = uploadData.url;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/publications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, avatarUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Create failed!");
        return;
      }

      toast.success("Publication created successfully!");
      navigate(`/publications/${data.publication.id}`);

    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Publication</h1>

      <div className="space-y-6">

        <div className="flex flex-col items-start gap-3">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-40 h-40 object-cover rounded-xl border shadow"
            />
          ) : (
            <div className="w-40 h-40 bg-gray-100 rounded-xl border shadow flex items-center justify-center">
              <RxAvatar size={70} className="opacity-50" />
            </div>
          )}

          <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-full shadow hover:bg-opacity-80">
            Choose Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Publication Name"
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          placeholder="Bio"
          rows="4"
          onChange={(e) => setBio(e.target.value)}
        ></textarea>

      </div>

      <button
        onClick={handleCreate}
        className="px-5 py-3 bg-black text-white rounded-full mt-6"
      >
        Create
      </button>
    </div>
  );
}