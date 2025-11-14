import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useLogOut from "../../hooks/useLogOut";

export default function AdminNavbar() {
  const [profile, setProfile] = useState(null);
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);

  const token = localStorage.getItem("token");
  const logOut = useLogOut();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        {/* --- LOGO --- */}
        <Link
          to="/admin/home"
          className="font-lora font-bold text-2xl text-gray-900"
        >
          Easium Admin
        </Link>

        <div className="flex items-center gap-4">
          {/* --- NOTIFICATION ICON --- */}
          <Link
            to="/admin/notifications"
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Bell className="w-5 h-5" />
          </Link>

          {/* --- AVATAR + DROPDOWN --- */}
          <div className="relative w-8 h-8">
            <button
              onClick={() => setIsAvatarDropdownShow(!isAvatarDropdownShow)}
              className="w-full h-full rounded-full overflow-hidden"
            >
              <img
                src={
                  profile?.avatarUrl ||
                  "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                }
                className="w-full h-full object-cover"
              />
            </button>

            {isAvatarDropdownShow && (
              <div className="absolute right-0 top-10 bg-white shadow border rounded-md w-40 overflow-hidden">
                <button
                  onClick={logOut}
                  className="block w-full text-left px-3 py-2 hover:bg-red-100 text-red-600"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
