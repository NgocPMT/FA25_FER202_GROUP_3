import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { BsChevronDown } from "react-icons/bs";

export default function Following() {
  const [activeTab, setActiveTab] = useState("writers"); // writers | topics
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("⚠️ Bạn chưa đăng nhập.");

        const [resFollowers, resFollowings] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/me/followers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/me/followings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!resFollowers.ok || !resFollowings.ok)
          throw new Error("Không thể tải dữ liệu người theo dõi.");

        const dataFollowers = await resFollowers.json();
        const dataFollowings = await resFollowings.json();

        setFollowers(
          Array.isArray(dataFollowers) ? dataFollowers : dataFollowers.data || []
        );
        setFollowings(
          Array.isArray(dataFollowings) ? dataFollowings : dataFollowings.data || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <h1 className="text-4xl font-semibold mb-8">Following</h1>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("writers")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
            activeTab === "writers"
              ? "bg-black text-white border-black"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Writers and publications
        </button>
        <button
          onClick={() => setActiveTab("topics")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
            activeTab === "topics"
              ? "bg-black text-white border-black"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Topics
        </button>
        <button className="p-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100">
          <FiPlus size={18} />
        </button>
      </div>

      {/* Dropdown */}
      <div className="flex items-center gap-2 mb-10">
        <button className="flex items-center gap-2 text-sm border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition">
          Recommended
          <BsChevronDown className="text-gray-500" />
        </button>
      </div>

      {/* Nội dung hiển thị */}
      {loading ? (
        <p className="text-gray-500">⏳ Đang tải...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : activeTab === "topics" ? (
        <div className="text-center py-24 border-t border-gray-200">
          <p className="text-lg font-medium text-gray-800 mb-2">No followed topics</p>
          <p className="text-gray-500 text-sm mb-4">
            Stories from topics you follow will be shown here.
          </p>
          <a
            href="#"
            className="text-sm text-gray-700 underline hover:text-black"
          >
            Find topics to follow
          </a>
        </div>
      ) : followings.length === 0 && followers.length === 0 ? (
        <div className="text-center py-24 border-t border-gray-200">
          <p className="text-lg font-medium text-gray-800 mb-2">
            You’re not following anyone yet.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Find writers and publications to follow.
          </p>
          <a
            href="#"
            className="text-sm text-gray-700 underline hover:text-black"
          >
            See suggestions
          </a>
        </div>
      ) : (
        <div className="border-t pt-8">
          {/* Followings */}
          <h2 className="text-xl font-semibold mb-4">Following</h2>
          {followings.length === 0 ? (
            <p className="text-gray-500 mb-8">No one you’re following.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {followings.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 border border-gray-200 p-4 rounded-lg hover:shadow-md transition"
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{user.username}</span>
                    <span className="text-gray-500 text-sm truncate max-w-[150px]">
                      {user.bio || "No bio"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Followers */}
          <h2 className="text-xl font-semibold mb-4">Followers</h2>
          {followers.length === 0 ? (
            <p className="text-gray-500">No followers yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {followers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 border border-gray-200 p-4 rounded-lg hover:shadow-md transition"
                >
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{user.username}</span>
                    <span className="text-gray-500 text-sm truncate max-w-[150px]">
                      {user.bio || "No bio"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
