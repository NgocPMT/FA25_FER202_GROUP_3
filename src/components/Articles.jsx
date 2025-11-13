import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Article from "../components/Article";
import useSavedPosts from "../hooks/useSavedPosts";

const Articles = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save post function
  const { toggleSave, savedIds } = useSavedPosts();

  // lấy query params
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const keyword = (searchParams.get("query") || "").trim(); // có/không đều OK
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 5);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // helper: cập nhật query string mà KHÔNG đổi layout/route
  const updateQuery = (next) => {
    const params = new URLSearchParams(location.search);
    if (typeof next.query !== "undefined") {
      if (next.query) params.set("query", next.query);
      else params.delete("query");
    }
    if (typeof next.page !== "undefined") params.set("page", String(next.page));
    if (typeof next.limit !== "undefined")
      params.set("limit", String(next.limit));
    navigate(
      { pathname: "/home", search: `?${params.toString()}` },
      { replace: false }
    );
  };

  // API: hỗ trợ cả chưa tìm và đang tìm cùng một endpoint 
  const API_URL = `${import.meta.env.VITE_API_URL
    }/posts?page=${page}&limit=${limit}&search=${encodeURIComponent(keyword)}`;

  useEffect(() => {
    let aborted = false;
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_URL, { method: "GET" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();

        if (!aborted) setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!aborted) setError("Unable to load article data");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    fetchArticles();
    return () => {
      aborted = true;
    };
  }, [API_URL]);

  const hasPrev = page > 1;
  const hasNext = articles.length >= limit; // nếu trả < limit → coi là hết data

  const handlePrev = () => {
    if (!hasPrev) return;
    updateQuery({ page: page - 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!hasNext) return;
    updateQuery({ page: page + 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value) || 5;
    updateQuery({ limit: newLimit, page: 1 });
  };

  if (loading) return <p>⏳ Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isSearching = !!keyword;

  // delete post
  function handleDeletePost(deletedId) {
    setArticles((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <div className="py-4">
      {isSearching && (
        <h1 className=" text-4xl font-semibold mb-10 text-gray-500">
          Result for <span className="text-black">{keyword}</span>
        </h1>
      )}

      <div className="flex items-center justify-between mb-6 pl-5 lg:pl-10">
        <div className="flex items-center gap-2 text-sm">
          <span><b>Display</b></span>
          <select
            className="border rounded px-2 py-1"
            value={limit}
            onChange={handleLimitChange}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/Pages
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8 px-4 sm:px-0 lg:px-0 w-full">

        {articles.length === 0 ? (
          <p className="text-gray-500 italic">
            {isSearching
              ? `No matching posts "${keyword}".`
              : "There are no posts yet."}
          </p>
        ) : (
          articles.map((post) => {
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


      {/* pagination */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`px-3 py-1  ${hasPrev
            ? "hover:bg-gray-50 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
            }`}
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">{page}</span>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`px-3 py-1  ${hasNext
            ? "hover:bg-gray-50 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Articles;
