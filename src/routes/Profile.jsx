import { RxAvatar } from "react-icons/rx";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SidebarProfile from "../components/SidebarProfile";
import Article from "../components/Article"
import useSavedPosts from "../hooks/useSavedPosts";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { username } = useParams();

  // Function save post
  const { toggleSave, savedIds } = useSavedPosts();

  const [profile, setProfile] = useState({
    name: "userName",
    avatarUrl: null,
    bio: "text",
    userId: "null"
  });
  const [follower, setFollower] = useState(0);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  // For follow button
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      const userId = res?.data?.userId;
      if (userId) checkIfFollowing(userId);
    });
    getFollower();
    setPage(1);
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
      return res;
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
      const newRoute = username
        ? `users/user/${username}/posts?page=${currentPage+1}&limit=${limit}`
        : `me/posts?page=${currentPage+1}&limit=${limit}`;
      const nextPost = await axios.get(`${import.meta.env.VITE_API_URL}/${newRoute}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setPosts(data);
      console.log("next: ", nextPost.data);
      setHasNext(data.length === limit && nextPost.data.length != 0);
    } catch (err) {
      console.log("Error get posts:", err);
    }
    setLoading(false);
  }

  function handleDeletePost(deletedId) {
  setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  async function checkIfFollowing(profileId) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/me/followings?page=1&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.followings || res.data;
      const alreadyFollow = Array.isArray(data)
        ? data.some((f) => f.followingId === Number(profileId))
        : false;
      setIsFollowing(alreadyFollow);
    } catch (err) {
      console.log("Error check following status:", err);
    }
  }

  async function toggleFollow() {
    console.log("profile.userId: ", profile.userId);
    console.log("isfollowing: ", isFollowing);
    if (!profile?.userId) {
      console.warn("Missing userId in profile:", profile);
      return;
    }
    try {
      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/me/followings/${profile.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
        setFollower((prev) => Math.max(0, prev - 1));
      } else {
        // Follow
        await axios.post(
          `${import.meta.env.VITE_API_URL}/me/followings`,
          { followingId: Number(profile.userId) }, // Đúng field
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setFollower((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Toggle follow error:", err.response?.data || err.message);
    }
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
        follower={follower}
        isFollowing={isFollowing}
        toggleFollow={toggleFollow}
        username={username}
      />
    </div>
  );
};

export default Profile;
