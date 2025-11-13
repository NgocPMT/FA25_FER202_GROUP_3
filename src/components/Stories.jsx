import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";
import { toast } from "react-toastify";
import { useLoader } from "@/context/LoaderContext";

export default function Stories() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const token = localStorage.getItem("token");


  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const activeTab = params.get("tab") || "Published";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.max(1, Number(params.get("limit")) || 10);

  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);

  const updateQuery = (next) => {
    const q = new URLSearchParams(location.search);

    if (next.tab) q.set("tab", next.tab);
    if (next.page) q.set("page", next.page);
    if (next.limit) q.set("limit", next.limit);

    navigate({ search: q.toString() }, { replace: false });
  };

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get("refresh") === "1") {
      updateQuery({ tab: "Published", page: 1 });
    }
  }, [location.search]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        showLoader();
        if (!token) throw new Error("You must login to see your stories");

        const endpoint =
          activeTab === "Drafts"
            ? `/me/draft-posts?page=${page}&limit=${limit}`
            : `/me/published-posts?page=${page}&limit=${limit}`;

        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load stories");

        const raw = await res.json();
        console.log("📌 FIXED BACKEND PAGING:", raw);
        console.log("📌 raw.data:", raw.data);
        console.log("📌 raw.items:", raw.items);
        console.log("📌 raw.posts:", raw.posts);
        console.log("📌 raw array?:", Array.isArray(raw));

        // const list = Array.isArray(raw) ? raw : raw.data ?? [];
        // const totalCount = Number(raw.total) || list.length;
        const list =
          raw.data ??
          raw.items ??
          raw.posts ??
          (Array.isArray(raw) ? raw : []);

        const totalCount =
          typeof raw.total === "number"
            ? raw.total
            : Array.isArray(list)
              ? list.length
              : 0;
        setStories(list);
        setTotal(totalCount);
      } catch (err) {
        toast.error(err.message);
      } finally {
        hideLoader();
      }
    };

    fetchStories();
  }, [activeTab, page, limit]);


  const totalPages = Math.ceil(total / limit);
  const hasPrev = page > 1;
  const hasNext = stories.length === limit;

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      toast.success("Deleted successfully");


      updateQuery({ page });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      <h1 className="text-3xl font-semibold mb-6">Stories</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        {["Drafts", "Published"].map((t) => (
          <button
            key={t}
            onClick={() => updateQuery({ tab: t, page: 1 })}
            className={`pb-2 text-sm font-medium ${activeTab === t
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-black"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        <div className="grid grid-cols-[2fr_1fr_1fr] text-sm text-gray-500 pb-3">
          <span>Latest</span>
          <span>Status</span>
        </div>

        {stories.length === 0 ? (
          <p className="text-center py-20 text-gray-600">No stories.</p>
        ) : (
          stories.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_1fr_1fr] border-b py-6 items-center relative"
            >
              <div className="flex items-center space-x-4 overflow-hidden pr-10">
                {p.coverImageUrl && (
                  <img
                    src={p.coverImageUrl}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}

                <div className="min-w-0">
                  <Link
                    to={`/posts/${p.slug}`}
                    className="font-semibold text-lg truncate hover:underline block"
                  >
                    {p.title}
                  </Link>

                  <p className="text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </p>

                  {activeTab === "Published" && (
                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <BsStarFill className="text-yellow-500" />
                        {p.PostReaction?.length || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <BsChat />
                        {p.comments?.length || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex items-center justify-between">
                <span className="text-gray-600 text-xs">{p.status}</span>

                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === p.id ? null : p.id)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiOutlineDotsHorizontal size={20} />
                </button>

                {menuOpen === p.id && (
                  <div className="absolute right-0 top-8 bg-white border shadow-md rounded-lg w-32">
                    <Link
                      to={`/posts/${p.slug}/edit`}
                      className="block px-4 py-2 hover:bg-gray-100"
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
        )}
      </div>

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => updateQuery({ page: page - 1 })}
            disabled={!hasPrev}
            className="px-3 py-1 border rounded-full disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1 text-gray-600">{page}</span>

          <button
            onClick={() => updateQuery({ page: page + 1 })}
            disabled={!hasNext}
            className="px-3 py-1 border rounded-full disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
