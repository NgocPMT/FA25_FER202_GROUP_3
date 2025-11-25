import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";
import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";

export default function PublicationList() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.max(1, Number(params.get("limit")) || 5);
  const search = params.get("search")?.trim() || "";
  const sort = params.get("sort") || "createdAt_desc";

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("all"); // ⭐ all / my

  const token = localStorage.getItem("token");

  const updateQuery = (next) => {
    const p = new URLSearchParams(location.search);

    if (next.page !== undefined) p.set("page", next.page);
    if (next.limit !== undefined) p.set("limit", next.limit);

    if (next.search !== undefined) {
      if (next.search) p.set("search", next.search);
      else p.delete("search");
    }

    if (next.sort !== undefined) {
      if (next.sort) p.set("sort", next.sort);
      else p.delete("sort");
    }

    navigate({ pathname: "/publications", search: p.toString() });
  };

  // ⭐ API URL ALL
  const API_URL_ALL =
    `${import.meta.env.VITE_API_URL}/publications?page=${page}&limit=${limit}&sort=${sort}` +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  // ⭐ LOAD ALL PUBLICATIONS
  async function loadAll() {
    setLoading(true);
    try {
      const res = await fetch(API_URL_ALL);
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.publications)
        ? data.publications
        : [];

      setPublications(list);

      if (list.length === 0 && page > 1) {
        updateQuery({ page: page - 1 });
      }
    } catch {
      toast.error("Failed to load publications");
    } finally {
      setLoading(false);
    }
  }

  // ⭐ LOAD MY PUBLICATIONS (API phân trang như ALL)
  async function loadMyPubs() {
    setLoading(true);

    try {
      const url =
        `${import.meta.env.VITE_API_URL}/me/publications?page=${page}&limit=${limit}&sort=${sort}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.publications)
        ? data.publications
        : [];

      setPublications(list);

      if (list.length === 0 && page > 1) {
        updateQuery({ page: page - 1 });
      }

    } catch (err) {
      toast.error("Failed to load your publications");
    } finally {
      setLoading(false);
    }
  }

  // ⭐ EFFECT LOAD theo tab mode
  useEffect(() => {
    if (mode === "all") loadAll();
    else loadMyPubs();
  }, [API_URL_ALL, mode, page, search, sort]);

  // ⭐ Pagination dùng chung cho cả 2 mode
  const hasPrev = page > 1;
  const hasNext = publications.length >= limit;

  return (
    <div className="flex gap-8 p-6 max-w-6xl mx-auto">

      {/* SIDEBAR */}
      <aside className="w-48 shrink-0">
        <h3 className="text-lg font-semibold mb-4">Sort by</h3>

        <div className="space-y-2">
          <button
            onClick={() =>
              updateQuery({
                sort: sort === "name_asc" ? "createdAt_desc" : "name_asc",
                page: 1,
              })
            }
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-full border 
              transition text-sm
              ${
                sort === "name_asc"
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
              }`}
          >
            <BsSortAlphaDown className="text-lg" />
            A → Z
          </button>

          <button
            onClick={() =>
              updateQuery({
                sort: sort === "name_desc" ? "createdAt_desc" : "name_desc",
                page: 1,
              })
            }
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-full border 
              transition text-sm
              ${
                sort === "name_desc"
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
              }`}
          >
            <BsSortAlphaUp className="text-lg" />
            Z → A
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1">

        {/* ⭐⭐⭐ TABS NẰM Ở TRÊN ⭐⭐⭐ */}
        <div className="flex gap-6 border-b pb-3 mb-6 text-lg">
          <button
            onClick={() => {
              setMode("all");
              updateQuery({ page: 1 });
            }}
            className={`pb-2 ${
              mode === "all"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            All Publications
          </button>

          <button
            onClick={() => {
              setMode("my");
              updateQuery({ page: 1 });
            }}
            className={`pb-2 ${
              mode === "my"
                ? "font-bold border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            My Publications
          </button>
        </div>

        {/* TITLE + BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {mode === "all" ? "Publications" : "My Publications"}
          </h1>

          <button
            onClick={() => navigate("/publications/create")}
            className="px-4 py-2 bg-black text-white rounded-full"
          >
            Create
          </button>
        </div>

        {/* SEARCH CHO CẢ 2 TAB */}
        <input
          className="w-full border px-4 py-2 rounded-xl mb-6"
          placeholder="Search publication..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateQuery({ search: e.target.value, page: 1 });
          }}
        />

        {/* LOADING */}
        {loading && <p>Loading...</p>}

        {/* LIST */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {publications.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/publications/${p.id}`)}
              className="p-5 rounded-xl bg-white cursor-pointer border border-gray-200 hover:shadow-md transition-shadow"
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

        {/* PAGINATION CHUNG CHO CẢ 2 TAB */}
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
    </div>
  );
}
