import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";

export default function Stories() {
  const [activeTab, setActiveTab] = useState("Drafts");
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
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    drafts: 0,
    published: 0,
    submissions: 0,
  });

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("⚠️ Bạn chưa đăng nhập, vui lòng đăng nhập lại.");

        // Fetch theo trang
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/posts?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("API fetch failed");

        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : raw.data || raw.posts || [];

        const normalize = (s) => (s ? s.toLowerCase().trim() : "");
        const drafts = data.filter((p) => normalize(p.status) === "draft");
        const published = data.filter(
          (p) => normalize(p.status) === "published" || !p.status
        );
        const submissions = data.filter((p) => normalize(p.status) === "submission");

        setStories({ drafts, published, submissions });

        // Lấy tổng bài viết
        const resAll = await fetch(
          `${import.meta.env.VITE_API_URL}/me/posts?page=1&limit=99999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allRaw = await resAll.json();
        const all = Array.isArray(allRaw) ? allRaw : allRaw.data || allRaw.posts || [];
        setCounts({
          drafts: all.filter((p) => normalize(p.status) === "draft").length,
          published: all.filter(
            (p) => normalize(p.status) === "published" || !p.status
          ).length,
          submissions: all.filter((p) => normalize(p.status) === "submission").length,
        });
        setTotal(all.length);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { name: "Drafts", count: counts.drafts },
    { name: "Published", count: counts.published },
    { name: "Submissions", count: counts.submissions },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto relative">
      <h1 className="text-3xl font-semibold mb-6">Stories</h1>

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-center text-gray-500 mb-4">⏳ Đang tải...</div>}

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab.name
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* PUBLISHED */}
      {activeTab === "Published" && (
        <div className="mt-8">
          <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-gray-500 pb-3">
            <span>Latest</span>
            <span>Publication</span>
            <span>Status</span>
          </div>

          {stories.published.length > 0 ? (
            stories.published.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_1fr_1fr] border-b border-gray-200 py-6 items-center"
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
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {p.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <BsStarFill className="text-yellow-500" /> {p.reactions ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <BsChat /> {p.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 truncate text-sm px-2">
                  {p.publication?.name || "None"}
                </div>
                <div className="relative flex items-center justify-between">
                  <span className="text-gray-600 text-xs truncate">
                    {p.status || "Published"}
                  </span>
                  <button
                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <HiOutlineDotsHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg font-medium">
                You haven’t published any stories yet.
              </p>
              <p className="text-sm mt-1">Start writing and share your first story!</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ Simple Pagination */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => page > 1 && setPage((p) => p - 1)}
          className={`px-3 py-1 rounded-full bg-white border transition hover:opacity-70 ${
            page === 1 ? "invisible" : ""
          }`}
        >
          Prev
        </button>

        <span className="px-3 py-1 text-gray-600 font-medium">{page}</span>

        <button
          onClick={() => page < totalPages && setPage((p) => p + 1)}
          className={`px-3 py-1 rounded-full bg-white border transition hover:opacity-70 ${
            page === totalPages ? "invisible" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
