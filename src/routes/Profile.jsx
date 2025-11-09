import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { username } = useParams();

  const [profile, setProfile] = useState({
    name: "userName",
    avatarUrl: null,
    bio: "text",
  });
  const [follower, setFollower] = useState(0);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    getProfile();
    getFollower();
    setPage(1);
  }, [username]);

  useEffect(() => {
    getPosts(page);
  }, [page, username]);

  async function getProfile() {
    try {
      const route = username ? `users/user/${username}/profile` : "me/profile";
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/${route}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(res.data);
    } catch (error) {
      console.error("Error profile:", error.response?.data || error.message);
    }
  }

  async function getFollower() {
    try {
      const route = username
        ? `users/user/${username}/followers`
        : "me/followers";
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/${route}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollower(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.log("Error get followers:", err);
    }
  }

  async function getPosts(currentPage) {
    setLoading(true);
    try {
      const route = username
        ? `users/user/${username}/posts?page=${currentPage}&limit=${limit}`
        : `me/posts?page=${currentPage}&limit=${limit}`;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/${route}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.posts || res.data;
      setPosts(data);

      // Kiểm tra còn bài để sang trang kế không
      setHasNext(data.length === limit);
    } catch (err) {
      console.log("Error get posts:", err);
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      {/* Main content */}
      <div className="p-6 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10 space-y-4">
          {/* Avatar (mobile) */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 object-cover rounded-full"
              />
            ) : (
              <RxAvatar className="w-16 h-16 text-black" />
            )}
            <h5 className="my-2 font-bold text-xl">{profile.name}</h5>
          </div>

          <h1 className="font-bold text-4xl mb-12 max-md:hidden">
            {profile.name}'s Posts
          </h1>

          {/* Danh sách bài viết */}
          <div className="space-y-8">
            {loading ? (
              <p className="text-gray-400 text-center">Đang tải...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                {username
                  ? `${profile.name} chưa có bài viết nào.`
                  : "Bạn chưa có bài viết nào."}
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-gray-500 mb-1">
                      In{" "}
                      <span className="font-semibold">
                        {post.publication?.name || "Independent"}
                      </span>{" "}
                      by {post.user?.username || "Unknown"}
                    </p>

                    <a
                      href={`/posts/${post.slug}`}
                      className="block text-xl font-bold text-gray-900 hover:underline"
                    >
                      {post.title}
                    </a>

                    <span className="text-gray-700 text-sm mt-1">
                      {post.updatedAt
                        ? new Date(post.updatedAt).toLocaleDateString("vi-VN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  {post.coverImageUrl && (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-40 h-28 object-cover rounded-md mt-4 md:mt-0"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* 🔹 Thanh phân trang theo giao diện bạn gửi */}
          {posts.length > 0 && (
            <div className="flex justify-center mt-6 gap-3">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-full bg-white transition ${
                  page === 1
                    ? "invisible"
                    : "cursor-pointer opacity-40 hover:opacity-60"
                }`}
              >
                Prev
              </button>

              <span className="px-3 py-1 opacity-70">{page}</span>

              {/* Next */}
              <button
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded-full bg-white transition ${
                  !hasNext
                    ? "invisible"
                    : "cursor-pointer opacity-40 hover:opacity-60"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar profile */}
      <div className="max-md:hidden top-14 right-0 h-[calc(100%-56px)] w-64 lg:w-96 border-l border-gray-200 p-4">
        <div className="mx-2 my-3 flex flex-col items-start">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 object-cover rounded-full"
            />
          ) : (
            <RxAvatar className="w-16 h-16 text-black" />
          )}
          <h5 className="my-2 font-bold">{profile.name}</h5>
          <h5 className="mb-2 text-gray-600">{follower} followers</h5>
          <p className="text-xs text-gray-600">{profile.bio}</p>

          {username ? (
            <button className="bg-black mt-7 px-4 py-2 text-sm text-white rounded-2xl cursor-pointer">
              Follow
            </button>
          ) : (
            <Link
              to="/profile/edit"
              className="mt-7 text-sm text-green-700 hover:text-violet-900"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
