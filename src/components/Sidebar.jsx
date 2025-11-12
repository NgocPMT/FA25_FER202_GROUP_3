import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BsBookmark } from "react-icons/bs";
const topics = [
  "Writing",
  "Cryptocurrency",
  "Relationships",
  "Productivity",
  "Politics",
  "Python",
  "Business",
];

const suggestions = [
  {
    name: "James Julian",
    bio: "James is a journalist, author, investor...",
    avatar: "https://i.pravatar.cc/48?img=8",
  },
  {
    name: "Lessons from History",
    bio: "Publication platform for historical insights...",
    avatar: "https://i.pravatar.cc/48?img=9",
  },
  {
    name: "Shanyvika Devi",
    bio: "Exploring mindfulness and growth...",
    avatar: "https://i.pravatar.cc/48?img=10",
  },
];

export default function RightSidebar() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [following, setFollowing] = useState(suggestions.map(() => false));
  const [emailNoti, setEmailNoti] = useState(suggestions.map(() => true));
  const [openMenu, setOpenMenu] = useState(null);
  const menuRefs = useRef([]);

  // Lấy bài viết mới nhất cho phần Staff Picks
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/posts?page=1&limit=100&search=`
        );
        const data = await res.json();

        const sorted = data
          .sort((a, b) => (b.PostReaction?.length || 0) - (a.PostReaction?.length || 0))
          .slice(0, 3);

        setLatestPosts(sorted);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenu !== null &&
        menuRefs.current[openMenu] &&
        !menuRefs.current[openMenu].contains(e.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const handleFollowToggle = (idx) => {
    setFollowing((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
    setOpenMenu(null);
  };

  const toggleEmailNoti = (idx) => {
    setEmailNoti((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  return (
    <aside className="hidden lg:block w-80 shrink-0 p-4">
      {/* STAFF PICKS (dữ liệu từ API) */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-4">Top Reaction</h2>

        {latestPosts.length === 0 ? (
          <p className="text-xs text-gray-500">No posts available.</p>
        ) : (
          <ul className="space-y-5">
            {latestPosts.map((post, idx) => (
              <li key={idx}>
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    to={`/profile/${post.user.username ?? "unknown"}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <img
                      src={
                        post.user.Profile.avatarUrl ||
                        "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                      }
                      alt={post.user.Profile.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <p className="text-xs text-gray-700">{post.user.Profile.name}</p>
                  </Link>
                </div>
                <Link
                  to={`/posts/${post.slug}`}
                  className="text-sm font-medium hover:underline cursor-pointer 
             leading-snug line-clamp-2 text-ellipsis overflow-hidden"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  ⭐
                  {post.PostReaction?.length || 0}
                  <span>· {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* <p className="text-xs text-green-700 mt-3 hover:underline cursor-pointer">
          See the full list
        </p> */}
      </section>

      {/* TOPICS */}
      {/* <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3">Recommended topics</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, idx) => (
            <span
              key={idx}
              className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
        <p className="text-xs text-green-700 mt-3 hover:underline cursor-pointer">
          See more topics
        </p>
      </section> */}

      {/* WHO TO FOLLOW */}
      {/* <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3">Who to follow</h2>
        <ul className="space-y-4">
          {suggestions.map((user, idx) => (
            <li key={idx} className="relative">
              <div className="flex items-start justify-between hover:bg-gray-50 rounded-lg p-1 transition">
                {/* Avatar + info */}
      {/* <a
                  href={`/@${user.name.replace(/\s+/g, "")}`}
                  className="flex gap-2"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 max-w-[150px]">
                      {user.bio}
                    </p>
                  </div>
                </a>  */}

      {/* Nút Follow / Following */}
      {/* {!following[idx] ? (
                  <button
                    onClick={() => handleFollowToggle(idx)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100 transition"
                  >
                    Follow
                  </button>
                ) : (
                  <div
                    className="relative"
                    ref={(el) => (menuRefs.current[idx] = el)}
                  >
                    <button
                      onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                      className="text-xs px-3 py-1 border rounded-full bg-black text-white flex items-center gap-1 hover:bg-gray-800 transition"
                    >
                      Following
                      <svg
                        className={`w-3 h-3 transition-transform ${openMenu === idx ? "rotate-180" : ""
                          }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button> */}

      {/* Dropdown menu */}
      {/* {openMenu === idx && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-sm animate-fade-slide">
                        <ul>
                          <li
                            onClick={() => toggleEmailNoti(idx)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {emailNoti[idx] ? (
                              <>
                                <span>📩</span> Email notifications on
                                <span className="ml-auto text-green-600 font-bold">
                                  ✓
                                </span>
                              </>
                            ) : (
                              <>
                                <span>📭</span> Email notifications off
                              </>
                            )}
                          </li>
                          <li
                            onClick={() => handleFollowToggle(idx)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            🚫 Unfollow
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-green-700 mt-3 hover:underline cursor-pointer">
          See more suggestions
        </p>
      </section> */}

      {/* READING LIST + FOOTER */}
      <section className="border-t pt-4 text-xs text-gray-500 space-y-2">
        <h2 className="text-sm font-semibold mb-2">Reading list</h2>
        <p className="flex items-center flex-wrap">
          Click the
          <span className="inline-flex items-center mx-1">
            <BsBookmark className="inline-block cursor-pointer hover:text-black" />
          </span>
          on any story to easily add it to your reading list or a custom list that you can share.
        </p>
        <div className="mt-3 space-x-2 flex flex-wrap text-[11px]">
          {[
            "Help",
            "Status",
            "About",
            "Careers",
            "Press",
            "Privacy",
            "Terms",
          ].map((link, idx) => (
            <a key={idx} href="#" className="hover:underline">
              {link}
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}
