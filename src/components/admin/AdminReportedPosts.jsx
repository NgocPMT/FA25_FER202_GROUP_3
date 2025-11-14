import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminReportedPosts() {
  const [reports, setReports] = useState([]);

  // INPUT STATES
  const [searchKeyword, setSearchKeyword] = useState("");
  const [authorInput, setAuthorInput] = useState("");

  // APPLIED SEARCH PARAMS (sent to API)
  const [titleSearch, setTitleSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // LỊCH SỬ (tối đa 5 mục)
  const [authorHistory, setAuthorHistory] = useState(
    JSON.parse(localStorage.getItem("authorHistory") || "[]")
  );
  const [titleHistory, setTitleHistory] = useState(
    JSON.parse(localStorage.getItem("titleHistory") || "[]")
  );

  // Dropdown
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [hasNext, setHasNext] = useState(false);

  // Fetch reports from API with search params
  const fetchReports = async () => {
    try {
      let url = `${
        import.meta.env.VITE_API_URL
      }/admin/reported-posts?page=${page}&limit=${limit}`;

      if (titleSearch) {
        url += `&titleSearch=${encodeURIComponent(titleSearch)}`;
      }
      if (userSearch) {
        url += `&userSearch=${encodeURIComponent(userSearch)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setReports(data.reportedPosts || []);
      setHasNext(data.reportedPosts.length === limit);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, limit, titleSearch, userSearch]);

  const updateHistory = (key, list, value) => {
    const updated = [value, ...list.filter((x) => x !== value)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  const saveAuthorHistory = (name) =>
    setAuthorHistory((prev) => updateHistory("authorHistory", prev, name));

  const saveTitleHistory = (title) =>
    setTitleHistory((prev) => updateHistory("titleHistory", prev, title));

  // Xóa lịch sử
  const removeHistoryItem = (type, value) => {
    const list = type === "author" ? authorHistory : titleHistory;
    const updated = list.filter((x) => x !== value);

    localStorage.setItem(
      type === "author" ? "authorHistory" : "titleHistory",
      JSON.stringify(updated)
    );

    type === "author" ? setAuthorHistory(updated) : setTitleHistory(updated);
  };

  const clearAllHistory = (type) => {
    localStorage.removeItem(
      type === "author" ? "authorHistory" : "titleHistory"
    );
    type === "author" ? setAuthorHistory([]) : setTitleHistory([]);
  };

  // APPLY SEARCH (ENTER hoặc SEARCH BUTTON)
  const applyTitleSearch = () => {
    if (searchKeyword.trim() === "") {
      setTitleSearch("");
      return;
    }
    setTitleSearch(searchKeyword.trim());
    saveTitleHistory(searchKeyword.trim());
    setShowTitleDropdown(false);
    setPage(1); // Reset to first page when searching
  };

  const applyAuthorSearch = () => {
    if (authorInput.trim() === "") {
      setUserSearch("");
      return;
    }
    setUserSearch(authorInput.trim());
    saveAuthorHistory(authorInput.trim());
    setShowAuthorDropdown(false);
    setPage(1); // Reset to first page when searching
  };

  const handleTitleKeyDown = (e) => e.key === "Enter" && applyTitleSearch();
  const handleAuthorKeyDown = (e) => e.key === "Enter" && applyAuthorSearch();

  const clearFilters = () => {
    setSearchKeyword("");
    setAuthorInput("");
    setTitleSearch("");
    setUserSearch("");
    setPage(1);
  };

  const handleClearReport = async (postId, userId) => {
    if (!confirm("Are you sure you want to clear this report?")) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/admin/reported-posts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });

      toast.success("Report cleared successfully!");
      fetchReports(); // Refresh list
    } catch (err) {
      toast.error("Failed to clear report. Please try again.");
    }
  };

  const handleDeletePost = async (postId, userId) => {
    if (!confirm("Are you sure you want to delete this post and its report?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetch(`${import.meta.env.VITE_API_URL}/admin/reported-posts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, userId }),
      });

      toast.success("Post deleted successfully!");
      fetchReports(); // Refresh list
    } catch (err) {
      toast.error("Failed to delete post. Please try again.");
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
        {/* AUTHOR SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Author Username"
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
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onFocus={() => setShowAuthorDropdown(true)}
            onBlur={() => setTimeout(() => setShowAuthorDropdown(false), 150)}
            onKeyDown={handleAuthorKeyDown}
          />

          {/* SEARCH BUTTON */}
          <button
            onClick={applyAuthorSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <IoSearchOutline size={18} />
          </button>

          {/* DROPDOWN */}
          {showAuthorDropdown &&
            authorHistory.length > 0 &&
            authorInput.trim() === "" && (
              <div className="absolute bg-white border rounded shadow w-full z-20 max-h-60 overflow-auto">
                <div className="flex justify-between px-3 py-1 text-xs text-gray-500">
                  History
                  <button
                    onClick={() => clearAllHistory("author")}
                    className="text-red-500 hover:underline"
                  >
                    Delete All
                  </button>
                </div>

                {authorHistory.map((name, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 flex justify-between hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setAuthorInput(name);
                      setUserSearch(name);
                      setPage(1);
                      saveAuthorHistory(name);
                      setShowAuthorDropdown(false);
                    }}
                  >
                    {name}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem("author", name);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* TITLE SEARCH */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <input
            type="text"
            placeholder="Post Title"
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
            onClick={applyTitleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <IoSearchOutline size={18} />
          </button>

          {/* TITLE DROPDOWN */}
          {showTitleDropdown &&
            titleHistory.length > 0 &&
            searchKeyword.trim() === "" && (
              <div className="absolute top-11 bg-white border rounded shadow w-full z-20 max-h-60 overflow-auto">
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
                      setTitleSearch(t);
                      setPage(1);
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
              <th className="p-3 border">Author</th>
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Reporter ID</th>
              <th className="p-3 border">Reporter</th>
              <th className="p-3 border">Reported At</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No reported posts found.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr key={`${item.postId}-${item.user.id}`} className="border">
                  <td className="p-3 border text-center">{item.postId}</td>

                  <td className="p-3 border text-center">
                    <Link
                      to={`/profile/${item.post.user?.username}`}
                      className="hover:underline"
                    >
                      {item.post.user?.username}
                    </Link>
                  </td>

                  <td className="p-3 border">
                    <Link
                      to={`/posts/${item.post.slug}`}
                      className="text-base md:text-[17px] lg:text-lg text-center font-semibold mb-1 
        hover:underline cursor-pointer leading-snug 
        whitespace-pre-line break-words line-clamp-2"
                    >
                      {formatTitle(item.post.title)}
                    </Link>
                  </td>

                  <td className="p-3 border w-32 text-center">
                    <img
                      src={item.post.coverImageUrl}
                      className="w-20 h-16 object-cover rounded"
                      alt="Post cover"
                    />
                  </td>

                  <td className="p-3 border text-center">{item.userId}</td>

                  <td className="p-3 border text-center">
                    <Link
                      to={`/profile/${item.user?.username}`}
                      className="hover:underline"
                    >
                      {item.user?.username}
                    </Link>
                  </td>

                  <td className="p-3 border text-center">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td className="p-3 border text-center">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          handleDeletePost(item.postId, item.user.id)
                        }
                        className="text-red-500 hover:text-red-700 cursor-pointer text-sm"
                        title="Delete post and report"
                      >
                        Delete Post
                      </button>
                      <button
                        onClick={() =>
                          handleClearReport(item.postId, item.user.id)
                        }
                        className="text-green-500 hover:text-green-700 cursor-pointer text-sm"
                        title="Clear report only"
                      >
                        Clear Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1 opacity-70">{page}</span>

          <button
            disabled={!hasNext}
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
