import { RxAvatar } from "react-icons/rx";
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import SidebarProfile from "../components/SidebarProfile";
import Article from "../components/Article"
import useSavedPosts from "../hooks/useSavedPosts";
import useFollow from "../hooks/useFollow";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { username } = useParams();
  const usernameToken = localStorage.getItem("username");
  const userAccount = username === usernameToken ? null : username;

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

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    getProfile().then((res) => {
      const userId = res?.userId;
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

      return data;
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

      // Fetch current page
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

      const data = await res.json();

      // Fetch next page
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

      // Check if page is empty after delete
      if (data.length === 0 && currentPage > 1) {
        setPage((p) => p - 1);
        setLoading(false);
        return;
      }

      // Update UI
      setPosts(data);
      setHasNext(data.length === limit && nextData.length !== 0);

    } catch (err) {
      console.log("Error get posts:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDeletePost() {
    getPosts(page);
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      <div className="p-10 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10 space-y-4">
          {/* Mobile UI */}
          <div className="flex items-center justify-between md:hidden mb-8">
            <div className="flex items-center gap-3">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <RxAvatar className="w-16 h-16 text-black" />
              )}

              <h5 className="font-bold text-xl">{profile.name}</h5>
            </div>

            <div className="flex">
              {userAccount ? (
                <button
                  onClick={() => toggleFollow(profile.userId)}
                  className={`px-4 py-2 text-sm rounded-2xl cursor-pointer transition
                    ${isFollowing
                      ? "bg-white border border-gray-300 text-black hover:bg-gray-100"
                      : "bg-black text-white hover:opacity-80"
                    }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              ) : (
                <Link
                  to="/profile/edit"
                  className="text-sm text-green-700 hover:text-violet-900"
                >
                  Edit Profile
                </Link>
              )}
            </div>
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
                  : "You haven't write any posts yet."}
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
