import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";

export default function AdminReportedPosts() {
  const [reports, setReports] = useState([]);

  // INPUT STATES
  const [searchKeyword, setSearchKeyword] = useState("");
  const [reporterInput, setReporterInput] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // FILTER States (chỉ áp dụng khi Enter hoặc nhấn Search)
  const [filterTitle, setFilterTitle] = useState("");
  const [filterReporter, setFilterReporter] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // LỊCH SỬ (tối đa 5 mục)
  const [reporterHistory, setReporterHistory] = useState(
    JSON.parse(localStorage.getItem("reporterHistory") || "[]")
  );
  const [titleHistory, setTitleHistory] = useState(
    JSON.parse(localStorage.getItem("titleHistory") || "[]")
  );

  // Dropdown
  const [showReporterDropdown, setShowReporterDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);

  // Fetch reports
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchReports = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reported-posts?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      setReports(data.reportedPosts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };


  useEffect(() => {
    fetchReports();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);


  // Unique suggestion lists
  const reporterList = [...new Set(reports.map((r) => r.user.username))];
  const titleList = [...new Set(reports.map((r) => r.post.title))];

  // Save history (max 5)
  const updateHistory = (key, list, value) => {
    const updated = [value, ...list.filter((x) => x !== value)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  const saveReporterHistory = (name) =>
    setReporterHistory((prev) => updateHistory("reporterHistory", prev, name));

  const saveTitleHistory = (title) =>
    setTitleHistory((prev) => updateHistory("titleHistory", prev, title));

  // Xóa lịch sử
  const removeHistoryItem = (type, value) => {
    const list = type === "reporter" ? reporterHistory : titleHistory;
    const updated = list.filter((x) => x !== value);

    localStorage.setItem(
      type === "reporter" ? "reporterHistory" : "titleHistory",
      JSON.stringify(updated)
    );

    type === "reporter"
      ? setReporterHistory(updated)
      : setTitleHistory(updated);
  };

  const clearAllHistory = (type) => {
    localStorage.removeItem(
      type === "reporter" ? "reporterHistory" : "titleHistory"
    );
    type === "reporter" ? setReporterHistory([]) : setTitleHistory([]);
  };

  // APPLY FILTER (ENTER hoặc SEARCH BUTTON)
  const applyTitleFilter = () => {
    if (!searchKeyword.trim()) return; // ⛔ Không lưu khi rỗng
    setFilterTitle(searchKeyword);
    saveTitleHistory(searchKeyword);
    setShowTitleDropdown(false);
  };

  const applyReporterFilter = () => {
    if (!reporterInput.trim()) return; // ⛔ Không lưu khi rỗng
    setFilterReporter(reporterInput);
    saveReporterHistory(reporterInput);
    setShowReporterDropdown(false);
  };
  const handleTitleKeyDown = (e) => e.key === "Enter" && applyTitleFilter();
  const handleReporterKeyDown = (e) => e.key === "Enter" && applyReporterFilter();

  // FILTER LOGIC
  const filteredReports = reports.filter((item) => {
    const postTitle = item.post.title.toLowerCase();
    const reporter = item.user.username.toLowerCase();

    const matchesTitle =
      !filterTitle || postTitle.includes(filterTitle.toLowerCase());

    const matchesReporter =
      !filterReporter || reporter.includes(filterReporter.toLowerCase());

    const createdAt = new Date(item.createdAt);
    const matchesStart = !filterStart || createdAt >= new Date(filterStart);
    const matchesEnd = !filterEnd || createdAt <= new Date(new Date(filterEnd).setHours(23, 59, 59, 999));

    return matchesTitle && matchesReporter && matchesStart && matchesEnd;
  });

  const clearFilters = () => {
    setSearchKeyword("");
    setReporterInput("");
    setDateStart("");
    setDateEnd("");
    setFilterTitle("");
    setFilterReporter("");
    setFilterStart("");
    setFilterEnd("");
  };


const handleDeleteReport = async (postId) => {
  if (!confirm("Are you sure you want to delete this post and its report?")) return;

  try {
    const token = localStorage.getItem("token");

    // 1. XÓA REPORT
    await fetch(`${import.meta.env.VITE_API_URL}/admin/reported-posts`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    });

    
    await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

   
    setReports((prev) => prev.filter((r) => r.postId !== postId));

    alert("Post and report deleted successfully!");

  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete post. Please try again.");
  }
};

  const formatTitle = (title) => {
    if (!title) return "Untitled";


    if (title.length <= 50) return title;

    if (title.length <= 100) {
      return (
        <>
          {title.slice(0, 65)}
          <br />
          {title.slice(65)}
        </>
      );
    }

    return (
      <>
        {title.slice(0, 65)}
        <br />
        {title.slice(50, 100)}...
      </>
    );
  };


  // ====================== UI ====================== //

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reported Posts</h1>
      {/* LIMIT SELECT */}
      <select
        value={limit}
        onChange={(e) => {
          setPage(1);
          setLimit(Number(e.target.value));
        }}
        className="border rounded px-3 py-1 mb-4"
      >
        <option value="5">5 / page</option>
        <option value="10">10 / page</option>
        <option value="20">20 / page</option>
        <option value="50">50 / page</option>
      </select>
      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 border flex flex-wrap items-center gap-3">

        {/* REPORTER SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Reporter"
            className="
              px-4 py-2 
              border border-gray-300 
              rounded-lg 
              bg-gray-50 
              focus:outline-none 
              focus:ring-0 
              focus:border-gray-400 
              focus:no-underline
            "
            value={reporterInput}
            onChange={(e) => setReporterInput(e.target.value)}
            onFocus={() => setShowReporterDropdown(true)}
            onBlur={() => setTimeout(() => setShowReporterDropdown(false), 150)}
            onKeyDown={handleReporterKeyDown}
          />


          {/* SEARCH BUTTON */}
          <button
            onClick={applyReporterFilter}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <IoSearchOutline size={18} />
          </button>

          {/* DROPDOWN */}
          {showReporterDropdown && (reporterInput.trim() !== "" || reporterHistory.length > 0) && (
            <div className="absolute bg-white border rounded shadow w-full z-20 max-h-60 overflow-auto">

              {/* ---------- CASE 1: INPUT TRỐNG → SHOW HISTORY ---------- */}
              {reporterInput.trim() === "" && reporterHistory.length > 0 && (
                <>
                  <div className="flex justify-between px-3 py-1 text-xs text-gray-500">
                    History
                    <button
                      onClick={() => clearAllHistory("reporter")}
                      className="text-red-500 hover:underline"
                    >
                      Delete All
                    </button>
                  </div>

                  {reporterHistory.map((name, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 flex justify-between hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setReporterInput(name);
                        setFilterReporter(name);
                        saveReporterHistory(name);
                        setShowReporterDropdown(false);
                      }}
                    >
                      {name}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem("reporter", name);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* ---------- CASE 2: INPUT CÓ TEXT → SHOW SUGGESTION ---------- */}
              {reporterInput.trim() !== "" && (
                <>
                  {reporterList
                    .filter((name) =>
                      name.toLowerCase().includes(reporterInput.toLowerCase())
                    )
                    .map((name, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setReporterInput(name);
                          setFilterReporter(name);
                          saveReporterHistory(name);
                          setShowReporterDropdown(false);
                        }}
                      >
                        {name}
                      </div>
                    ))}

                  {/* Nếu không có suggestion */}
                  {reporterList.filter((name) =>
                    name.toLowerCase().includes(reporterInput.toLowerCase())
                  ).length === 0 && (
                      <div className="px-3 py-2 text-gray-400 italic">Not Found</div>
                    )}
                </>
              )}

            </div>
          )}
        </div>

        {/* DATE RANGE */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="px-3 py-2 border rounded-lg bg-gray-50"
            value={dateStart}
            onChange={(e) => {
              setDateStart(e.target.value);
              setFilterStart(e.target.value);
            }}
          />
          <span>-</span>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg bg-gray-50"
            value={dateEnd}
            min={dateStart}
            onChange={(e) => {
              const newEnd = e.target.value;
              if (dateStart && newEnd < dateStart) {
                setDateEnd(dateStart);
                setFilterEnd(dateStart);
                return;
              }

              setDateEnd(newEnd);
              setFilterEnd(newEnd);
            }}
          />
        </div>

        {/* TITLE SEARCH */}
        <div className="relative flex-1 max-w-xs ml-auto">


          <input
            type="text"
            placeholder="Title"
            className="w-full border bg-gray-50 rounded-full pl-10 pr-8 py-2 text-sm
             focus:outline-none focus:ring-0 focus:border-gray-300"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => setShowTitleDropdown(true)}
            onBlur={() => setTimeout(() => setShowTitleDropdown(false), 150)}
            onKeyDown={handleTitleKeyDown}
          />

          {/* SEARCH BUTTON */}
          <button
            onClick={applyTitleFilter}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <IoSearchOutline size={18} />
          </button>

          {/* TITLE DROPDOWN */}
          {showTitleDropdown && (searchKeyword.trim() !== "" || titleHistory.length > 0) && (
            <div className="absolute top-11 bg-white border rounded shadow w-full z-20 max-h-60 overflow-auto">

              {/* CASE 1: INPUT TRỐNG → SHOW HISTORY */}
              {searchKeyword.trim() === "" && titleHistory.length > 0 && (
                <>
                  <div className="flex justify-between px-3 py-1 text-xs text-gray-500">
                    History
                    <button
                      onClick={() => clearAllHistory("title")}
                      className="text-red-500 hover:underline"
                    >
                      Delete All
                    </button>
                  </div>

                  {titleHistory.map((t, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 flex justify-between hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSearchKeyword(t);
                        setFilterTitle(t);
                        saveTitleHistory(t);
                        setShowTitleDropdown(false);
                      }}
                    >
                      {t}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem("title", t);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* CASE 2: CÓ TỪ KHÓA → SHOW SUGGESTION */}
              {searchKeyword.trim() !== "" && (
                <>
                  {titleList
                    .filter((t) =>
                      t.toLowerCase().includes(searchKeyword.toLowerCase())
                    )
                    .map((t, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchKeyword(t);
                          setFilterTitle(t);
                          saveTitleHistory(t);
                          setShowTitleDropdown(false);
                        }}
                      >
                        {t}
                      </div>
                    ))}

                  {/* Không có gợi ý */}
                  {titleList.filter((t) =>
                    t.toLowerCase().includes(searchKeyword.toLowerCase())
                  ).length === 0 && (
                      <div className="px-3 py-2 text-gray-400 italic">
                        Article not found
                      </div>
                    )}
                </>
              )}
            </div>
          )}

        </div>

        {/* CLEAR FILTER */}
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Post ID</th>
              <th className="p-3 border">Author ID</th>
              <th className="p-3 border">Author</th>
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Reporter ID</th>
              <th className="p-3 border">Reporter</th>
              <th className="p-3 border">Reported At</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No reported posts found.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr key={item.postId} className="border">
                  <td className="p-3 border">{item.postId}</td>
                  <td className="p-3 border">{item.post.user?.id}</td>

                  <td className="p-3 border">
                    <Link
                      to={`/profile/${item.post.user?.username}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.post.user?.username}
                    </Link>
                  </td>

                  <td className="p-3 border">
                    <Link
                      to={`/posts/${item.post.slug}`}
                      className="text-base sm:text-lg md:text-[17px] lg:text-xl font-semibold mb-1 
        hover:underline cursor-pointer leading-snug 
        whitespace-pre-line break-words line-clamp-2"
                    >
                      {formatTitle(item.post.title)}
                    </Link>
                  </td>

                  <td className="p-3 border w-32">
                    <img
                      src={item.post.coverImageUrl}
                      className="w-20 h-16 object-cover rounded"
                    />
                  </td>

                  <td className="p-3 border">{item.userId}</td>

                  <td className="p-3 border">
                    <Link
                      to={`/profile/${item.user?.username}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.user?.username}
                    </Link>
                  </td>

                  <td className="p-3 border">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleDeleteReport(item.postId)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete report"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* PAGINATION */}
      <div className="flex items-center justify-center mt-4">



        {/* PAGE NUMBERS */}
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-500 text-white" : ""
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
