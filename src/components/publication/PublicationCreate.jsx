import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PublicationCreate() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [recentPublications, setRecentPublications] = useState([]);

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

  useEffect(() => {
    const loadPublications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/publications`);
        const data = await res.json();
        if (Array.isArray(data)) setRecentPublications(data);
        else if (Array.isArray(data?.publications)) setRecentPublications(data.publications);
      } catch {
      }
    };

    loadPublications();
  }, []);

  return (
    <div className="flex gap-8 p-6 max-w-6xl mx-auto">
      <div className="flex-1">
        <div className="mb-4">
          <button
            onClick={() => navigate("/publications")}
            className="fixed bottom-6 right-6 px-4 py-2 bg-black text-white text-sm rounded-full shadow-lg hover:bg-opacity-80 z-50"
          >
            Back to list
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Create Publication</h1>

        <div className="space-y-6">
          <div className="flex flex-col items-start gap-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                className="w-40 h-40 object-cover rounded-xl border shadow"
              />
            ) : (
              <div className="w-35 h-35 bg-gray-100 rounded-xl border shadow flex items-center justify-center">
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

          <div className="space-y-4">
            <div>
              <label style={{ fontWeight: 'bold' }} className="block mb-1 font-medium">Publication Name</label>
              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Publication Name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1" style={{ fontWeight: 'bold' }}>Bio</label>
              <textarea
                className="w-full border p-3 rounded-xl"
                placeholder="Bio"
                rows="3"
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
            </div>
          </div>


          <button
            onClick={handleCreate}
            className="px-5 py-3 bg-black text-white rounded-full"
          >
            Create
          </button>
        </div>
      </div>

      <aside className="w-64 border rounded-lg p-4 max-h-[350px] overflow-y-auto mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Publications</h3>
        <div className="space-y-4 text-sm">
          {recentPublications.map((pub) => (
            <div
              key={pub.id}
              onClick={() => navigate(`/publications/${pub.id}`)}
              className="cursor-pointer border p-2 rounded hover:bg-gray-50 transition"
            >
              <p className="font-medium">{pub.name}</p>
              <p className="text-gray-500 text-xs line-clamp-1">
                {pub.bio || "No description"}
              </p>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
}
