import { RxAvatar } from "react-icons/rx";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { username } = useParams();

  const [profile, setProfile] = useState({
    name: "userName",
    avatarurl: null,
    bio: "text",
  });
  const [follower, setFollower] = useState(0);

  // lazy load post
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  // Gọi profile + follower khi username thay đổi
  useEffect(() => {
    getProfile();
    getFollower();
    // reset lại danh sách bài viết mỗi khi đổi user
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [username]);

  // Gọi danh sách bài viết theo page (lazy load)
  useEffect(() => {
    getPosts(page);
  }, [page]);

  // Tự load khi cuộn đến cuối
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  async function getProfile() {
    try {
      const endpoint = username
        ? `/users/user/${username}/profile`
        : "/me/profile";
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(data);
    } catch {
      console.log("Error profile data");
    }
  }

  async function getFollower() {
    try {
      const endpoint = username
        ? `/users/user/${username}/followers`
        : "/me/followers";
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFollower(data);
    } catch {
      console.log("Error get follower");
    }
  }

  async function getPosts(page) {
    if (!hasMore) return;
    setLoading(true);
    try {
      const endpoint = username
        ? `/users/user/${username}/posts?page=${page}&limit=5`
        : `/me/posts?page=${page}&limit=5`;
      const data = await axios.get(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // lấy thêm post mới khi cuộn xuống
      setPosts((prev) => {
        const newItems = data.data.filter(
          (item) => !prev.some((p) => p.id === item.id)
        );
        return [...prev, ...newItems];
      });
      setHasMore(data.hasMore);
    } catch {
      console.log("Error get posts");
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      <div className="p-6 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10 space-y-4">
          <div className="flex items-center gap-3 mb-8 md:hidden">
            {profile.avatarurl ? (
              <img
                src={profile.avatarurl}
                alt="Avatar"
                className="w-16 h-16 object-cover rounded-full"
              />
            ) : (
              <RxAvatar className="w-16 h-16 object-cover rounded-full text-black" />
            )}
            <h5 className="my-2 font-bold text-xl">{profile.name}</h5>
          </div>

          <h1 className="font-bold text-4xl mb-12 max-md:hidden">
            {profile.name}'s Posts
          </h1>

          <div className="space-y-8">
            {posts.length === 0 && !loading ? (
              <p className="text-gray-500 text-center italic">
                {username
                  ? `${profile.name} hasn't posted anything yet.`
                  : "You haven't posted anything yet."}
              </p>
            ) : (
              posts.map((post, index) => {
                const isLast = posts.length === index + 1;
                return (
                  <div
                    ref={isLast ? lastPostRef : null}
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
                          ? new Date(post.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
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
                );
              })
            )}

            {loading && (
              <p className="text-gray-400 text-center">Loading more posts...</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="max-md:hidden top-14 right-0 h-[calc(100%-56px)] w-64 lg:w-96 bg-300 border-l border-gray-200 p-4">
        <div className="mx-2 my-3 flex flex-col items-start">
          {profile.avatarurl ? (
            <img
              src={profile.avatarurl}
              alt="Avatar"
              className="w-16 h-16 object-cover rounded-full"
            />
          ) : (
            <RxAvatar className="w-16 h-16 object-cover rounded-full text-black" />
          )}
          <h5 className="my-2 bold">{profile.name}</h5>
          <h5 className="mb-2 text-gray-600">{follower} follower</h5>
          <p className="text-xs text-gray-600">{profile.bio}</p>

          {username ? (
            <button className="bg-black mt-7 px-4 py-2 text-sm text-white rounded-2xl cursor-pointer">
              Follow
            </button>
          ) : (
            <Link
              to="/profile/edit"
              className="mt-7 text-sm text-green-700 cursor-pointer hover:text-violet-900"
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
