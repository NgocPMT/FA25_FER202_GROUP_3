import { useEffect, useState } from "react";

export default function FollowersList() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 3;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) throw new Error("⚠️ Bạn chưa đăng nhập.");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/followers?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Nếu token hết hạn
        if (res.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        const data = await res.json();
        console.log("✅ Followers API response:", data);

        if (!res.ok || data.error)
          throw new Error(data.message || "Không thể tải danh sách Followers.");

        // ✅ Chuẩn hóa dữ liệu backend
        const rawList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        // ✅ Map đúng key “follower”
        const list = rawList
          .map((item) => item.followedBy || item.follower || item.Follower || item.user || {})

          .filter((f) => f && f.id);

        setFollowers(list);
        setTotal(data.total || rawList.length);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [page, token]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleFollowBack = async (userId) => {
    try {
      console.log("📤 Sending follow request:", {
        followingId: Number(userId),
        token: token?.slice(0, 20) + "..."
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/me/followings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId: Number(userId) }),
      });

      const data = await res.json();
      console.log("📩 Follow back response:", data);

      // ✅ Nếu đã follow rồi thì hiển thị thông báo nhẹ
      if (data.error === "You have followed this user") {
        alert("ℹ️ Bạn đã follow người này rồi.");
        return;
      }

      if (!res.ok) throw new Error(data.message || "Follow back failed.");

      alert("✅ Followed back!");
    } catch (err) {
      console.error("❌ Follow back error:", err);
      alert("❌ " + err.message);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* 🔹 Trạng thái tải / lỗi */}
      {loading && <p className="text-gray-500">⏳ Đang tải danh sách...</p>}
      {error && !loading && <p className="text-red-500 mb-4">{error}</p>}

      {/* 🔹 Danh sách người theo dõi */}
      {!loading && followers.length === 0 && !error && (
        <p className="text-gray-500">No followers yet.</p>
      )}

      {followers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {followers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {user.username || "Unknown user"}
                  </span>
                  <span className="text-gray-500 text-sm truncate max-w-[150px]">
                    {user.bio || "No bio"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleFollowBack(user.id)}
                className="text-sm border rounded-full px-3 py-1 hover:bg-gray-100"
              >
                Follow back
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Phân trang (3 người mỗi trang) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">
            Trang {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
