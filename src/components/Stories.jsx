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
  const [pubModal, setPubModal] = useState(false);
  const [myPublications, setMyPublications] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);


  const token = localStorage.getItem("token");

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const activeTab = params.get("tab") || "Published";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.max(1, Number(params.get("limit")) || 5);

  const [stories, setStories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [hasNext, setHasNext] = useState(false);

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
            : activeTab === "Published"
              ? `/me/published-posts?page=${page}&limit=${limit}`
              : `/me/pending-posts?page=${page}&limit=${limit}`;


        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load stories");

        const raw = await res.json();
        const list =
          raw.data ?? raw.items ?? raw.posts ?? (Array.isArray(raw) ? raw : []);

        const totalCount =
          typeof raw.total === "number"
            ? raw.total
            : Array.isArray(list)
              ? list.length
              : 0;
        setStories(list);
        setHasNext(totalCount === limit);
      } catch (err) {
        toast.error(err.message);
      } finally {
        hideLoader();
      }
    };

    fetchStories();
  }, [activeTab, page, limit]);

  const handlePublishPost = async (slug) => {
    try {
      showLoader();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/draft-posts/${slug}/publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      toast.success("Publish successfully");
      setStories(stories.filter((story) => story.slug !== slug));
    } catch (err) {
      toast.error(err.message);
    } finally {
      hideLoader();
    }
  };

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
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/me/publications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMyPublications(data || []));
  }, []);
  const submitDraftToPublication = async (publicationId) => {
    try {
      showLoader();
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications/${publicationId}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: selectedDraft.title,
            content: selectedDraft.content,
            coverImageUrl: selectedDraft.coverImageUrl,
            topics: selectedDraft.postTopics?.map(t => t.topicId) || [],
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success("Submitted to publication (pending approval)");
      navigate(`/publications/${publicationId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPubModal(false);
      hideLoader();
    }
  };
  const publishDraftAsPersonal = async () => {
    try {
      showLoader();
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/draft-posts/${selectedDraft.slug}/publish`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success("Draft published successfully!");
      updateQuery({ page });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPubModal(false);
      hideLoader();
    }
  };


  return (
    <div className="max-w-5xl mx-auto relative">
      <h1 className="text-3xl font-semibold mb-6">Stories</h1>

      <div className="flex space-x-6 border-b mb-6">
        {["Drafts", "Published", "Pending"].map((t) => (

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
                  onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiOutlineDotsHorizontal size={20} />
                </button>

                {menuOpen === p.id && (
                  <div className="absolute right-0 top-8 bg-white border shadow-md rounded-lg w-32">
                    {activeTab === "Drafts" && (
                      <button
                        onClick={() => {
                          setSelectedDraft(p);   // lưu bài draft đang publish
                          setPubModal(true);     // mở popup
                        }}
                        className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-100"
                      >
                        Publish
                      </button>

                    )}
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
      {pubModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-xl shadow-xl">

            <h2 className="text-xl font-semibold mb-4 text-center">
              Publish Draft to Publication
            </h2>

            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
              {myPublications.length === 0 ? (
                <p className="text-gray-600 text-center">
                  You are not a member of any publication.
                </p>
              ) : (
                myPublications.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => submitDraftToPublication(p.id)}
                    className="w-full p-3 border rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <img
                      src={
                        p.avatarUrl ||
                        "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                      }
                      className="w-8 h-8 rounded-md object-cover border"
                    />
                    <span className="font-medium">{p.name}</span>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={publishDraftAsPersonal}
              className="w-full p-3 mt-4 bg-black text-white rounded-lg cursor-pointer"
            >
              Publish as Personal Post
            </button>

            <button
              onClick={() => setPubModal(false)}
              className="w-full mt-3 text-gray-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => updateQuery({ page: page - 1 })}
          disabled={page <= 1}
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
    </div>
  );
}
