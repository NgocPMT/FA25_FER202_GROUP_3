import { useLoader } from "@/context/LoaderContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function FollowingList() {
  const [followings, setFollowings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [isEmptyPage, setIsEmptyPage] = useState(false);
  const limit = 9;
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const { showLoader, hideLoader } = useLoader();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFollowings();
  }, [page]);

  const fetchFollowings = async () => {
    try {
      showLoader();
      setIsEmptyPage(false);

      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/me/followings?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Unable to load Following list.");

      const data = await res.json();
      console.log("Followings API response:", data);

      const rawList = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      const list = rawList
        .map((item) => item.following)
        .filter((f) => f && f.id);

      if (list.length === 0 && page > 1) {
        setIsEmptyPage(true);
        setHasNext(false);
        return;
      }

      setFollowings(list);
      setHasNext(list.length === limit);
    } catch (err) {
      toast.error(err.message);
    } finally {
      hideLoader();
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
      toast.success("Unfollowed successfully!");
    } catch (err) {
      toast.error(" " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {followings.length === 0 && !isEmptyPage && (
        <p className="text-gray-500 text-center">
          You’re not following anyone yet.
        </p>
      )}

      {followings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {followings.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-md transition w-full max-w-[320px] mx-auto"
            >
              {user.username ? (
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-3 w-[75%] overflow-hidden"
                >
                  <img
                    src={
                      user.Profile.avatarUrl ||
                      "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-800 hover:underline block leading-tight">
                      {user.username}
                    </span>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2 break-words">
                      {user.Profile.bio || "No bio"}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 w-[75%] overflow-hidden">
                  <img
                    src="https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                    alt="unknown"
                    className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-800 truncate">
                      Unknown user
                    </span>
                    <span className="text-gray-500 text-sm truncate">
                      No bio
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setTargetUser(user);
                  setShowConfirm(true);
                }}
                className="text-sm border rounded-full px-3 py-1 hover:bg-gray-100 flex-shrink-0 cursor-pointer"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}

      {(followings.length > 0 || isEmptyPage) && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">{page}</span>

          <button
            onClick={() => hasNext && setPage((p) => p + 1)}
            disabled={!hasNext}
            className="px-3 py-1 border rounded-full hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[320px] text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Unfollow {targetUser?.username}?
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              They will no longer appear in your following list.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleUnfollow(targetUser.id);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 text-sm rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
