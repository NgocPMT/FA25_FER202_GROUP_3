import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FollowersList() {
  const [followers, setFollowers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const limit = 3;

  const token = localStorage.getItem("token");

  // 🟩 Fetch followers mỗi lần đổi trang
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) throw new Error("⚠️ You are not logged in.");

        let res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followers?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 🧩 Nếu backend chưa hỗ trợ query, fallback gọi không có query
        if (res.status === 500) {
          console.warn("⚠ Backend không hỗ trợ phân trang followers, fallback...");
          res = await fetch(`${import.meta.env.VITE_API_URL}/me/followers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        if (!res.ok) throw new Error("Unable to load Followers list.");

        const data = await res.json();
        console.log("✅ Followers API response:", data);

        const rawList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        const list = rawList
          .map(
            (item) =>
              item.followedBy ||
              item.follower ||
              item.Follower ||
              item.user
          )
          .filter((f) => f && f.id);

        setFollowers(list);

        // ✅ Nếu ít hơn limit → hết trang, không còn next
        setHasNext(list.length === limit);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [token, page]);

  // 🟦 Fetch followings để biết ai đã follow lại
  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/followings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const ids =
          Array.isArray(data.data)
            ? data.data.map((f) => f.following?.id)
            : Array.isArray(data)
              ? data.map((f) => f.following?.id)
              : [];
        setFollowingIds(ids.filter(Boolean));
      } catch {
        console.warn("⚠ Could not load followings list.");
      }
    };
    fetchFollowings();
  }, [token]);

  // 🟨 Follow / Unfollow toggle
  const handleToggleFollow = async (userId, isFollowing) => {
    try {
      setMessage(null);

      if (isFollowing) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followings/${userId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Unfollow failed.");

        setFollowingIds((prev) => prev.filter((id) => id !== userId));
        setMessage("✅ Unfollowed successfully!");
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/followings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ followingId: Number(userId) }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Follow back failed.");

        setFollowingIds((prev) => [...prev, userId]);
        setMessage("✅ Followed back!");
      }
    } catch (err) {
      console.error("❌ Toggle follow error:", err);
      setMessage("❌ " + err.message);
    } finally {
      setTimeout(() => setMessage(null), 1000);
    }
  };

  // 🧭 UI render
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 🟦 Message */}
      {message && (
        <div className="text-center mb-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md py-2">
          {message}
        </div>
      )}

      {/* 🟥 Error */}
      {error && !loading && (
        <div className="text-center mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md py-2">
          {error}
        </div>
      )}

      {/* ⏳ Loading */}
      {loading && <p className="text-gray-500">Loading list...</p>}

      {/* ❌ Empty */}
      {!loading && followers.length === 0 && !error && (
        <p className="text-gray-500 text-center">No followers yet.</p>
      )}

      {/* ✅ List */}
      {followers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {followers.map((user) => {
            const isFollowing = followingIds.includes(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-md transition w-full max-w-[320px] mx-auto"
              >
                <Link
                  to={`/users/${user.username}`}
                  className="flex items-center gap-3 w-[75%] overflow-hidden"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-800 truncate hover:underline">
                      {user.username || "Unknown user"}
                    </span>
                    <span className="text-gray-500 text-sm truncate">
                      {user.bio || "No bio"}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => handleToggleFollow(user.id, isFollowing)}
                  className={`text-sm border rounded-full px-3 py-1 transition ${isFollowing
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "hover:bg-gray-100"
                    }`}
                >
                  {isFollowing ? "Unfollow" : "Follow back"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 🧭 Pagination */}
      {followers.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">{page}</span>

          <button
            onClick={() => hasNext && setPage((p) => p + 1)}
            disabled={!hasNext}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
