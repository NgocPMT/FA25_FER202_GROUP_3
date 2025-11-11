import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FollowingList() {
    const [followings, setFollowings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFollowings = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!token) throw new Error("⚠️ Bạn chưa đăng nhập.");

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/me/followings?page=${page}&limit=${limit}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const data = await res.json();
                console.log("✅ Followings API response:", data);

                if (!res.ok)
                    throw new Error(data.message || "Không thể tải danh sách Following.");

                // ✅ Lấy đúng danh sách và giữ nguyên phân trang
                const rawList = Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data)
                        ? data
                        : [];

                // ✅ Map đúng key “following”
                const list = rawList
                    .map((item) => item.following)
                    .filter((f) => f && f.id);

                setFollowings(list);
                setTotal(data.total || rawList.length);
            } catch (err) {
                console.error("❌ Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowings();
    }, [page]);


    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleUnfollow = async (userId) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/me/followings/${userId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Unfollow failed.");
            setFollowings((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            alert("❌ " + err.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <p className="text-gray-500">⏳ Đang tải danh sách...</p>}

            {!loading && followings.length === 0 && (
                <p className="text-gray-500">You’re not following anyone yet.</p>
            )}

            {followings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {followings.map((user) => (
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
                                        {user.username}
                                    </span>
                                    <span className="text-gray-500 text-sm truncate max-w-[150px]">
                                        {user.bio || "No bio"}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleUnfollow(user.id)}
                                className="text-sm border rounded-full px-3 py-1 hover:bg-gray-100"
                            >
                                Unfollow
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded-full disabled:opacity-40 hover:bg-gray-100"
                    >
                        Prev
                    </button>
                    <span className="text-gray-700">{page}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded-full disabled:opacity-40 hover:bg-gray-100"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
