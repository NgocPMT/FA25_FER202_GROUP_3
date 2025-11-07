import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Article from "../components/Article";

const Articles = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // lấy query params
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const keyword = (searchParams.get("query") || "").trim();   // có/không đều OK
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
    if (typeof next.limit !== "undefined") params.set("limit", String(next.limit));
    navigate({ pathname: "/home", search: `?${params.toString()}` }, { replace: false });
  };

  // API: hỗ trợ cả chưa tìm và đang tìm cùng một endpoint
  const API_URL = `${import.meta.env.VITE_API_URL}/posts?page=${page}&limit=${limit}&search=${encodeURIComponent(keyword)}`;

  useEffect(() => {
    let aborted = false;
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);

        // theo note của bạn: fetch/axios.action(`${VITE_API_URL}/route`)
        // dùng native fetch GET:
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
    return () => { aborted = true; };
  }, [API_URL]);

  // Heuristic next/prev: nếu backend chưa trả total,
  // ta dựa vào độ dài mảng để disable nút "Next"
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
    // đổi limit → quay về page 1 để tránh trống trang
    updateQuery({ limit: newLimit, page: 1 });
  };

  if (loading) return <p>⏳ Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isSearching = !!keyword;

  return (
    <div className="px-6 py-4">
      {/* tiêu đề kết quả khi đang tìm */}
      {isSearching && (
        <h1 className=" text-4xl font-semibold mb-10 text-gray-500">
          Result for <span className="text-black">{keyword}</span>
        </h1>
      )}

      {/* controls: limit + trang hiện tại */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span>Display</span>
          <select
            className="border rounded px-2 py-1"
            value={limit}
            onChange={handleLimitChange}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}/Pages</option>
            ))}
          </select>
        </div>
      </div>

      {/* danh sách bài viết */}
      <div className="space-y-8">
        {articles.length === 0 ? (
          <p className="text-gray-500 italic">
            {isSearching
              ? `No matching posts "${keyword}".`
              : "There are no posts yet."}
          </p>
        ) : (
          articles.map((post) => <Article key={post.id} data={post} />)
        )}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`px-3 py-1 rounded border ${hasPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">Pages{page}</span>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`px-3 py-1 rounded border ${hasNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Articles;