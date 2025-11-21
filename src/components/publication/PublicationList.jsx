import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";

export default function PublicationList() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.max(1, Number(params.get("limit")) || 5);
  const search = params.get("search")?.trim() || "";

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateQuery = (next) => {
    const p = new URLSearchParams(location.search);

    if (next.page !== undefined) p.set("page", next.page);
    if (next.limit !== undefined) p.set("limit", next.limit);
    if (next.search !== undefined) {
      if (next.search) p.set("search", next.search);
      else p.delete("search");
    }

    navigate({ pathname: "/publications", search: p.toString() });
  };

  const API_URL =
    `${import.meta.env.VITE_API_URL}/publications?page=${page}&limit=${limit}` +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.publications)
            ? data.publications
            : [];

        if (!cancelled) {
          setPublications(list);

          if (list.length === 0 && page > 1) {
            updateQuery({ page: page - 1 });
            return;
          }
        }
      } catch {
        toast.error("Failed to load publications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [API_URL]);

  const hasPrev = page > 1;
  const hasNext = publications.length >= limit;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Publications</h1>

        <button
          onClick={() => navigate("/publications/create")}
          className="px-4 py-2 bg-black text-white rounded-full"
        >
          Create
        </button>
      </div>

      <input
        className="w-full border px-4 py-2 rounded-xl mb-6"
        placeholder="Search publication..."
        defaultValue={search}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateQuery({ search: e.target.value, page: 1 });
        }}
      />

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 gap-4 mt-4">
        {publications.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/publications/${p.id}`)}
            className="
    p-5 rounded-xl bg-white cursor-pointer
    border border-gray-200
    hover:shadow-md transition-shadow
  "
          >
            <div className="flex items-center gap-4">
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <RxAvatar className="w-10 h-10 text-gray-400" />
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="text-gray-500 text-sm">
                  {p.bio || "No description"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-3">
        <button
          disabled={!hasPrev}
          onClick={() => updateQuery({ page: page - 1 })}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2">{page}</span>

        <button
          disabled={!hasNext}
          onClick={() => updateQuery({ page: page + 1 })}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}