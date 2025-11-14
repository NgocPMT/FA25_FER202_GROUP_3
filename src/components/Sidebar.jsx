import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BsBookmark } from "react-icons/bs";

export default function RightSidebar() {
  const [latestPosts, setLatestPosts] = useState([]);
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

      </section>

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
