import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoader } from "@/context/LoaderContext";

export default function Stories() {
  const [activeTab, setActiveTab] = useState("Published");
  const [menuOpen, setMenuOpen] = useState(null);
  const [stories, setStories] = useState({
    drafts: [],
    published: [],
  });
  const menuRef = useRef(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [counts, setCounts] = useState({
    drafts: 0,
    published: 0,
  });
  const [isUserPaging, setIsUserPaging] = useState(false);
  const listTopRef = useRef(null);
  const token = localStorage.getItem("token");
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        showLoader();
        if (!token) throw new Error("You must login to see your stories");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/posts?page=1&limit=99999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("API fetch failed");

        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : raw.data || raw.posts || [];

        const normalize = (s) => (s ? s.toLowerCase().trim() : "");
        const sortByDateDesc = (arr) =>
          arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(data);
        const drafts = sortByDateDesc(
          data.filter((p) => normalize(p.status) === "draft")
        );
        const published = sortByDateDesc(
          data.filter((p) => normalize(p.status) === "published")
        );

        setStories({ drafts, published });
        setCounts({
          drafts: drafts.length,
          published: published.length,
        });
      } catch (err) {
        toast.error(err);
      } finally {
        hideLoader();
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    if (!isUserPaging) return;
    if (listTopRef.current)
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsUserPaging(false);
  }, [page]);

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
        toast.error(errorData);
        return;
      }

      setStories((prev) => ({
        drafts: prev.drafts.filter((p) => p.id !== postId),
        published: prev.published.filter((p) => p.id !== postId),
      }));

      toast.success("Deleted successfully.");
      setMenuOpen(null);
    } catch (error) {
      toast.error(error);
    }
  };

  const tabs = [
    { name: "Drafts", count: counts.drafts },
    { name: "Published", count: counts.published },
  ];

  const currentList =
    activeTab === "Drafts" ? stories.drafts : stories.published;

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedList = currentList.slice(start, end);

  const totalPages = Math.ceil(currentList.length / limit);

  return (
    stories && (
      <div className="max-w-5xl mx-auto relative">
        <h1 className="text-3xl font-semibold mb-6">Stories</h1>
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setPage(1);
              }}
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

        <div className="mt-8" ref={listTopRef}>
          <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-gray-500 pb-3">
            <span>Latest</span>
            <span>Status</span>
          </div>

          {paginatedList.length > 0 ? (
            paginatedList.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_1fr_1fr] border-b border-gray-200 py-6 items-center relative"
              >
                {/* Left */}
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
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <BsStarFill className="text-yellow-500" />{" "}
                        {p.reactions ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <BsChat /> {p.comments ?? 0}
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
                      <Link
                        to={`/posts/${p.slug}/edit`}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDeletePost(p.id)}
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

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => {
              setIsUserPaging(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            className={`px-3 py-1 rounded-full bg-white border transition hover:opacity-70 ${
              page === 1 ? "invisible" : ""
            }`}
          >
            Prev
          </button>

          <span className="px-3 py-1 text-gray-600 font-medium">{page}</span>

          <button
            onClick={() => {
              if (page < totalPages) {
                setIsUserPaging(true);
                setPage((p) => p + 1);
              }
            }}
            className={`px-3 py-1 rounded-full bg-white border transition hover:opacity-70 ${
              page >= totalPages ? "invisible" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    )
  );
}
