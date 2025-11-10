import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { BsBookmark, BsBookmarkFill, BsThreeDots } from "react-icons/bs";

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
  const [savedPosts, setSavedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);


  // ✅ Hàm rút gọn tiêu đề
  const formatTitle = (title) => {
    if (!title) return "Untitled";
    if (title.length <= 50) return title;
    if (title.length <= 80) {
      return (
        <>
          {title.slice(0, 50)}
          <br />
          {title.slice(50)}
        </>
      );
    }
    return (
      <>
        {title.slice(0, 100)}
        ...
      </>
    );
  };

  useEffect(() => {
    getProfile().then(() => {
      if (username && profile.id) {
        checkIfFollowing(profile.id);
      }
    });
    getFollower();
    setPage(1);
    getSavedPosts();
    checkFollowStatus();
  }, [username]);

  useEffect(() => {
    getPosts(page);
  }, [page, username]);

  async function getProfile() {
    try {
      const route = username ? `users/user/${username}/profile` : "me/profile";
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/${route}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      const data = res.data;
      setPosts(data);
      setHasNext(data.length === limit);
    } catch (err) {
      console.log("Error get posts:", err);
    }
    setLoading(false);
  }

  async function getSavedPosts() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/saved-posts?page=1&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPosts(res.data.posts || res.data);
    } catch (err) {
      console.log("Error get saved posts:", err);
    }
  }

  async function toggleSave(postId) {
    try {
      const isSaved = savedPosts.some((p) => p.postId === postId);

      if (isSaved) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/me/saved-posts/${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await getSavedPosts();
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/me/saved-posts`,
          { postId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await getSavedPosts();
      }
    } catch (err) {
      console.log("Toggle save error:", err);
    }
  }

  async function checkIfFollowing(profileId) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/followers?page=1&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Dữ liệu có thể là mảng follower objects
      const data = res.data.followers || res.data;

      // Kiểm tra xem có người dùng nào trùng ID với profile hiện tại không
      const alreadyFollow = Array.isArray(data)
        ? data.some((f) => f.followingId === profileId || f.followedById === profileId)
        : false;

      setIsFollowing(alreadyFollow);
    } catch (err) {
      console.log("Error check following status:", err);
    }
  }

  async function toggleFollow() {
    if (!profile?.id) return;
    try {
      if (isFollowing) {
        // ❌ Unfollow
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/users/${profile.id}/unfollow`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
        setFollower((prev) => Math.max(0, prev - 1));
      } else {
        // ✅ Follow
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/${profile.id}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setFollower((prev) => prev + 1);
      }
    } catch (err) {
      console.log("Toggle follow error:", err);
    }
  }


  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      {/* Main content */}
      <div className="p-10 lg:pl-32 transition-all duration-300 z-10">
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
              <p className="text-gray-400 text-center">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                {username
                  ? `${profile.name} have no posts.`
                  : "You haven't any posts yet."}
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex md:flex-row flex-col justify-between border-b border-gray-100 pb-6 min-h-[120px]"
                >
                  {/* ✅ Bên trái - phần text */}
                  <div className="flex flex-col justify-between flex-1 pr-4">
                    {/* Tiêu đề */}
                    <div>
                      <Link
                        to={`/posts/${post.slug}`}
                        className="pb-2 block text-xl font-bold text-gray-900 hover:underline leading-snug"
                      >
                        {formatTitle(post.title)}
                      </Link>
                    </div>

                    {/* ✅ Ngày tháng + nút luôn nằm dưới */}
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <span className="text-gray-700 text-sm">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                          : ""}
                      </span>

                      <div className="flex items-center gap-5">
                        {savedPosts.some((p) => p.postId === post.id) ? (
                          <BsBookmarkFill
                            className="cursor-pointer text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleSave(post.id);
                            }}
                          />
                        ) : (
                          <BsBookmark
                            className="cursor-pointer hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleSave(post.id);
                            }}
                          />
                        )}
                        <BsThreeDots className="cursor-pointer hover:text-black" />
                      </div>
                    </div>
                  </div>

                  {/* ✅ Bên phải - ảnh (nếu có, nếu không vẫn giữ không gian) */}
                  <div className="w-40 h-28 mt-4 md:mt-0 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // placeholder nhẹ giúp giữ cân bằng khi không có ảnh
                      <div className="w-full h-full flex items-center justify-center">
                        No cover
                      </div>
                    )}
                  </div>
                </div>

              ))
            )}
          </div>

          {/* Pagination */}
          {posts.length > 0 && (
            <div className="flex justify-center mt-6 gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-full bg-white transition ${page === 1
                  ? "invisible"
                  : "cursor-pointer opacity-40 hover:opacity-60"
                  }`}
              >
                Prev
              </button>

              <span className="px-3 py-1 opacity-70">{page}</span>

              <button
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded-full bg-white transition ${!hasNext
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

      {/* Sidebar */}
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
            <button
              onClick={toggleFollow}
              className={`mt-7 px-4 py-2 text-sm rounded-2xl cursor-pointer transition 
      ${isFollowing
                  ? "bg-white border border-gray-300 text-black hover:bg-gray-100"
                  : "bg-black text-white hover:opacity-80"}`}
            >
              {isFollowing ? "Following" : "Follow"}
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
