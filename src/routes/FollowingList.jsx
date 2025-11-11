import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FollowingList() {
    const [followings, setFollowings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [isEmptyPage, setIsEmptyPage] = useState(false);
    const limit = 3;

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchFollowings();
    }, [page]);

    const fetchFollowings = async () => {
        try {
            setLoading(true);
            setError(null);
            setIsEmptyPage(false);

            let res = await fetch(
                `${import.meta.env.VITE_API_URL}/me/followings?page=${page}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🧩 Nếu backend lỗi 500 → fallback gọi không có query
            if (res.status === 500) {
                console.warn("⚠ Backend không hỗ trợ phân trang. Gọi không có query...");
                res = await fetch(`${import.meta.env.VITE_API_URL}/me/followings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHasNext(false);
            }

            if (!res.ok) throw new Error("Unable to load Following list.");

            const data = await res.json();
            console.log("✅ Followings API response:", data);

            const rawList = Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                    ? data
                    : [];

            const list = rawList
                .map((item) => item.following || item.Following || item.user)
                .filter((f) => f && f.id);

            // ✅ Nếu rỗng nhưng không phải trang đầu => đánh dấu trang trống
            if (list.length === 0 && page > 1) {
                setIsEmptyPage(true);
                setHasNext(false);
                return;
            }

            setFollowings(list);

            // ✅ Nếu có ít hơn limit -> hết trang sau
            setHasNext(list.length === limit);
        } catch (err) {
            console.error("❌ Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            setMessage("✅ Unfollowed successfully!");
            setTimeout(() => setMessage(null), 1000);
        } catch (err) {
            setMessage("❌ " + err.message);
            setTimeout(() => setMessage(null), 1000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* ✅ Message & Error */}
            {message && (
                <div className="text-center mb-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md py-2">
                    {message}
                </div>
            )}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <p className="text-gray-500">⏳ Loading...</p>}

            {/* ✅ Empty */}
            {!loading && followings.length === 0 && !error && !isEmptyPage && (
                <p className="text-gray-500 text-center">You’re not following anyone yet.</p>
            )}

            {/* ✅ Danh sách */}
            {followings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {followings.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-md transition w-full max-w-[320px] mx-auto"
                        >
                            {/* 🧩 Link bọc ảnh + username */}
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
                                onClick={() => handleUnfollow(user.id)}
                                className="text-sm border rounded-full px-3 py-1 hover:bg-gray-100 flex-shrink-0"
                            >
                                Unfollow
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Phân trang (luôn hiện để quay lại trang cũ) */}
            {(followings.length > 0 || isEmptyPage) && (
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