import { RxAvatar } from "react-icons/rx";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import SidebarProfile from "../components/SidebarProfile";
import Article from "../components/Article"
import useSavedPosts from "../hooks/useSavedPosts";
import useFollow from "../hooks/useFollow";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { username } = useParams();

  // Function save post
  const { toggleSave, savedIds } = useSavedPosts();

  // For follower/following
  const {
    isFollowing,
    followerCount,
    checkIfFollowing,
    getFollower,
    toggleFollow
  } = useFollow();

  const [profile, setProfile] = useState({
    name: "userName",
    avatarUrl: null,
    bio: "text",
    userId: "null"
  });
  // const [follower, setFollower] = useState(0);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    getProfile().then((res) => {
      const userId = res?.data?.userId;
      if (userId) checkIfFollowing(userId);
    });
    getFollower(username);
    setPage(1);
  }, [username]);

  useEffect(() => {
    getPosts(page);
  }, [page, username]);

  async function getProfile() {
    try {
      const route = username ? `users/user/${username}/profile` : "me/profile";

      const res = await fetch(`${import.meta.env.VITE_API_URL}/${route}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data);

      return data; // vì axios trả res, fetch trả data 
    } catch (error) {
      console.error("Error profile:", error.message);
    }
  }

  async function getPosts(currentPage) {
    setLoading(true);

    try {
      const route = username
        ? `users/user/${username}/posts?page=${currentPage}&limit=${limit}`
        : `me/posts?page=${currentPage}&limit=${limit}`;

      // ---- Fetch trang hiện tại ----
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${route}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch posts");
      }

      const data = await res.json(); // giống res.data


      // ---- Fetch trang kế tiếp để check hasNext ----
      const nextRoute = username
        ? `users/user/${username}/posts?page=${currentPage + 1}&limit=${limit}`
        : `me/posts?page=${currentPage + 1}&limit=${limit}`;

      const nextRes = await fetch(`${import.meta.env.VITE_API_URL}/${nextRoute}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!nextRes.ok) {
        const errData = await nextRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch next posts");
      }

      const nextData = await nextRes.json();

      if (data.length === 0 && currentPage > 1) {
        setPage((p) => p - 1);
        setLoading(false);
        return;
      }

      // ---- Cập nhật UI ----
      setPosts(data);
      setHasNext(data.length === limit && nextData.length !== 0);

    } catch (err) {
      console.log("Error get posts:", err.message);
    }

    setLoading(false);
  }


  function handleDeletePost(deletedId) {
    getPosts(page);
    
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      <div className="p-10 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10 space-y-4">
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
              posts.map((post) => {
                const saved = savedIds.has(post.id);
                return <Article
                  key={post.id}
                  data={post}
                  isSaved={saved}
                  onSave={() => toggleSave(post.id)}
                  onDelete={handleDeletePost} />
              })
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
      <SidebarProfile
        profile={profile}
        follower={followerCount}
        isFollowing={isFollowing}
        toggleFollow={() => toggleFollow(profile.userId)}
        username={username}
      />
    </div>
  );
};

export default Profile;
