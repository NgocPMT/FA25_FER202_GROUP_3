import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios'

const EditProfile = () => {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState({
    name: "userName",
    avatarUrl: null,
    bio: "text"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    getProfile();
  }, [username]);

  async function getProfile() {
    try {
      const endpoint = username ? `/users/user/${username}/profile` : "/me/profile";
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(data);
    } catch {
      console.log("Error profile data");
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Gửi file lên backend
      const formData = new FormData();
      formData.append("file", file);

      const data = await axios.post(
        `${import.meta.env.VITE_API_URL}/images/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = data.data.url;
      setProfile((prev) => ({ ...prev, avatarUrl: imageUrl }));
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
    }
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    setIsSaving(true);
    setSuccessMessage(""); 

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/me/profile`,
        {
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", res.data);
      await getProfile();

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    } finally {
      setIsSaving(false); 
    }
  }


  return (
    <div className="px-16 py-8 container">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 pb-2">
        Profile Information
      </h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
        <div className="relative group">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-32 h-32 object-cover rounded-full ring-4 ring-blue-200 group-hover:ring-blue-400 transition duration-300"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ring-4 ring-blue-200 group-hover:ring-blue-400 transition duration-300">
              <RxAvatar className="w-20 h-20" />
            </div>
          )}

          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-xs font-medium">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            Change Img
          </label>
        </div>

        <div className="flex-1 w-full space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-gray-100 mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="bg-gray-100 mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full font-semibold tracking-wide px-4 py-3 rounded-lg shadow-md transition duration-200
    ${isSaving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
      >
        {isSaving ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Saving...
          </div>
        ) : (
          "Save Changes"
        )}
      </button>

      {successMessage && (
        <p className="text-green-600 text-center mt-3 transition-opacity duration-500">
          {successMessage}
        </p>
      )}

    </div>
  );
};

export default EditProfile;
