import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function Stories() {
  const [activeTab, setActiveTab] = useState("Published");
  const [menuOpen, setMenuOpen] = useState(null);
  const [stories, setStories] = useState({
    drafts: [],
    published: [],
    submissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [counts, setCounts] = useState({
    drafts: 0,
    published: 0,
    submissions: 0,
  });
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const listTopRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token)
          throw new Error("You are not logged in, please log in again.");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/posts?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Unable to load article list.");

        const raw = await res.json();
        const data = Array.isArray(raw)
          ? raw
          : raw.data || raw.posts || raw.items || [];

        const totalCount = raw.total || data.length;

        const getTime = (p) => {
          const dateStr = p.publishedAt || p.updatedAt || p.createdAt;
          return dateStr ? new Date(dateStr).getTime() : 0;
        };

        const sorted = [...data].sort((a, b) => getTime(b) - getTime(a));

        console.table(
          sorted.map((p) => ({
            id: p.id,
            title: p.title,
            date: p.publishedAt || p.updatedAt || p.createdAt,
          }))
        );

        const normalize = (s) => (s ? s.toLowerCase().trim() : "");
        const drafts = sorted.filter((p) => normalize(p.status) === "draft");
        const published = sorted.filter(
          (p) => normalize(p.status) === "published" || !p.status
        );
        const submissions = sorted.filter(
          (p) => normalize(p.status) === "submission"
        );

        setStories({ drafts, published, submissions });
        setCounts({
          drafts: drafts.length,
          published: published.length,
          submissions: submissions.length,
        });
        setHasNext(data.length === limit);
        setTotal(totalCount);
      } catch (err) {
        setError(err.message || "Unable to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [page, token]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete post!");
        return;
      }

      setStories((prev) => ({
        drafts: prev.drafts.filter((p) => p.id !== postId),
        published: prev.published.filter((p) => p.id !== postId),
        submissions: prev.submissions.filter((p) => p.id !== postId),
      }));

      setMenuOpen(null);
    } catch {
      alert("Unexpected error occurred.");
    }
  };

  const tabs = [{ name: "Published", count: counts.published }];

  const currentList =
    activeTab === "Drafts"
      ? stories.drafts
      : activeTab === "Submissions"
        ? stories.submissions
        : stories.published;

  return (
    <div className="max-w-5xl mx-auto relative">
      <h1 className="text-3xl font-semibold mb-6">Stories</h1>

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      {loading && (
        <div className="text-center text-gray-500 mb-4">⏳ Đang tải...</div>
      )}

      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setPage(1);
            }}
            className={`pb-2 text-sm font-medium ${activeTab === tab.name
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-black"
              }`}
          >
            {tab.name} ({tab.count}/{total})
          </button>
        ))}
      </div>

      <div className="mt-8" ref={listTopRef}>
        <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-gray-500 pb-3">
          <span>Latest</span>
          <span>Status</span>
        </div>

        {currentList.length > 0 ? (
          currentList.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_1fr_1fr] border-b border-gray-200 py-6 items-center relative"
            >
              <div className="flex items-center space-x-4 overflow-hidden pr-10">
                {p.coverImageUrl && (
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}
                <div className="min-w-0">
                  <Link
                    to={`/posts/${p.slug}`}
                    className="font-semibold text-lg text-gray-900 truncate hover:underline block max-w-full"
                  >
                    {p.title || "Untitled"}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">
                    {new Date(
                      p.publishedAt || p.updatedAt || p.createdAt
                    ).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">

                    <span className="flex items-center gap-1">
                      <BsStarFill className="text-yellow-500" />{" "}
                      {Array.isArray(p.PostReaction) ? p.PostReaction.length : p.reactions ?? 0}
                    </span>

                    <span className="flex items-center gap-1">
                      <BsChat />{" "}
                      {Array.isArray(p.comments) ? p.comments.length : p.comments ?? 0}
                    </span>
                  </div>

                </div>
              </div>

              <div
                className="relative flex items-center justify-between"
                ref={menuRef}
              >
                <span className="text-gray-600 text-xs truncate">
                  {p.status || "Published"}
                </span>
                <button
                  onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiOutlineDotsHorizontal size={20} />
                </button>

                {menuOpen === p.id && (
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-md z-10 w-36 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(p.id);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg font-medium">
              You haven’t published any stories yet.
            </p>
            <p className="text-sm mt-1">
              Start writing and share your first story!
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-full bg-white border transition hover:opacity-70 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-3 py-1 text-gray-600 font-medium">{page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="px-3 py-1 rounded-full bg-white border transition hover:opacity-70 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
