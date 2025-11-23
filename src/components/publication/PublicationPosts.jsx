import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Article from "../Article";
import useSavedPosts from "../../hooks/useSavedPosts";

const PublicationPosts = () => {
  const { publicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { toggleSave, savedIds } = useSavedPosts();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const keyword = (searchParams.get("query") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 5);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      {
        pathname: `/publications/${publicationId}`,
        search: `?${params.toString()}`,
      },
      { replace: false }
    );
  };

  const API_URL =
    `${import.meta.env.VITE_API_URL}/publications/${publicationId}/posts` +
    `?page=${page}&limit=${limit}&search=${encodeURIComponent(keyword)}`;

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
        if (!aborted) setError("Unable to load articles");
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
  const hasNext = articles.length >= limit;

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

  function handleDeletePost(deletedId) {
    setArticles((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <div className="py-4">
      {isSearching && (
        <h1 className=" text-4xl font-semibold mb-10 text-gray-500 px-4 lg:px-10">
          Result for <span className="text-black">{keyword}</span>
        </h1>
      )}

      <div className="flex items-center justify-between mb-6 pl-5 lg:pl-10">
        <div className="flex items-center gap-2 text-sm">
          <span>
            <b>Display</b>
          </span>
          <select
            className="border rounded px-2 py-1"
            value={limit}
            onChange={handleLimitChange}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/Page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8 px-4 sm:px-0 lg:px-0 w-full">
        {articles.length === 0 ? (
          <p className="text-gray-500 italic px-4 lg:px-10">
            {isSearching
              ? `No matching posts "${keyword}".`
              : "There are no posts yet in this publication."}
          </p>
        ) : (
          articles.map((post) => {
            const saved = savedIds.has(post.id);
            return (
              <Article
                key={post.id}
                data={post}
                isSaved={saved}
                onSave={() => toggleSave(post.id, saved)}
                onDelete={handleDeletePost}
              />
            );
          })
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`px-3 py-1  ${
            hasPrev
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
          className={`px-3 py-1  ${
            hasNext
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

export default PublicationPosts;