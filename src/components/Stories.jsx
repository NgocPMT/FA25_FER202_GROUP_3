import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";

export default function Stories({ filter, onToggleStatusFilter }) {
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

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Chưa có token. Vui lòng đăng nhập lại.");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/posts?page=1`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("✅ ME POSTS:", data);
        console.log("🧩 DEBUG POSTS:", data.map(p => ({ id: p.id, title: p.title, status: p.status })));

        const normalize = (s) => (s ? s.toLowerCase().trim() : "");

        const drafts = data.filter((p) => normalize(p.status) === "draft");
        const published = data.filter((p) => normalize(p.status) === "published");
        const submissions = data.filter((p) => normalize(p.status) === "submission");

        setStories({ drafts, published, submissions });
      } catch (err) {
        console.error("❌ API ERROR:", err);
        setError(err.message || "Không thể tải dữ liệu bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { name: "Drafts", count: stories.drafts.length },
    { name: "Published", count: stories.published.length },
    { name: "Submissions", count: stories.submissions.length },
  ];

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
            className={`pb-2 text-sm font-medium ${activeTab === tab.name
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-black"
              }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* DRAFTS */}
      {activeTab === "Drafts" && (
        <div>
          {stories.drafts.length > 0 ? (
            stories.drafts.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center border-b border-gray-200 py-4 relative"
              >
                <div>
                  <h3 className="font-medium text-lg">{d.title}</h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(d.createdAt).toLocaleDateString("vi-VN")} · 5 min read
                  </p>
                </div>
                <div ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <HiOutlineDotsHorizontal size={20} />
                  </button>
                  {menuOpen === d.id && (
                    <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-md z-10 w-36 text-sm">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Edit
                      </button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Publish
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg">You have no stories in draft.</p>
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED */}
      {activeTab === "Published" && (
        <div className="mt-8">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-gray-500 pb-3">
            <span>Latest</span>
            <span>Publication</span>
            <span>Status</span>
          </div>

          {/* Body */}
          {stories.published.length > 0 ? (
            stories.published.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_1fr_1fr] border-b border-gray-200 py-6 items-center"
              >
                {/* Latest */}
                <div className="flex items-center space-x-4 overflow-hidden pr-10">
                  {/* Chỉ hiển thị ảnh nếu có coverImageUrl hoặc thumbnail */}
                  {(p.coverImageUrl || p.thumbnail) && (
                    <img
                      src={p.coverImageUrl || p.thumbnail}
                      alt={p.title}
                      className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                    />
                  )}

                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {p.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      Published {new Date(p.createdAt).toLocaleDateString("vi-VN")} · Updated{" "}
                      {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
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

                {/* Publication */}
                <div className="text-gray-600 truncate text-sm px-2">
                  {p.publication?.name || "None"}
                </div>

                {/* Status + Menu */}
                <div className="relative flex items-center justify-between">
                  <span className="text-gray-600 text-xs truncate">{p.status || "Published"}</span>
                  <button
                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <HiOutlineDotsHorizontal size={20} />
                  </button>

                  {menuOpen === p.id && (
                    <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-md z-10 w-36 text-sm">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">View</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
                      <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg font-medium">You haven’t published any stories yet.</p>
              <p className="text-sm mt-1">Start writing and share your first story!</p>
            </div>
          )}
        </div>
      )}





      {/* SUBMISSIONS */}
      {activeTab === "Submissions" && (
        <div className="mt-8 relative">
          <div className="flex justify-between text-sm text-gray-500 pb-2 relative">
            <span>Latest</span>
            <div className="flex space-x-24 items-center">
              <span>Publication</span>
              <button
                className="flex items-center space-x-1"
                onClick={onToggleStatusFilter}
              >
                <span>Status</span>
                <span>▼</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            {stories.submissions.length > 0 ? (
              stories.submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between border-b border-gray-200 py-3"
                >
                  <span>{s.publication ?? "Unknown"}</span>
                  <span className="text-gray-600">{s.status ?? "Pending"}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-600">
                <p className="text-lg">No submissions yet.</p>
                <p className="mt-2">Submit your story to a publication to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
