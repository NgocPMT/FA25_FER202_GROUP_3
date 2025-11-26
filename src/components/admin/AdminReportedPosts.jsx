import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { FiTrash2, FiCheckCircle } from "react-icons/fi";

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
  const limit = 7;
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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reported-post`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId, userId }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
      }

      const data = await res.json();
      toast.success(data.message);
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

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-300 mb-6 border flex flex-wrap items-center gap-3">
        {/* AUTHOR SEARCH */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Author Username"
            className="
              border border-gray-300 px-4 py-2 rounded-full  w-full pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-100
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
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer px-2"
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
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Post Title"
            className="border border-gray-300 px-3 py-2 rounded-full  w-full pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onFocus={() => setShowTitleDropdown(true)}
            onBlur={() => setTimeout(() => setShowTitleDropdown(false), 150)}
            onKeyDown={handleTitleKeyDown}
          />

          {/* SEARCH BUTTON */}
          <button
            onClick={applyTitleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
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
          className="px-4 py-2 rounded-lg border border-green-300 text-green-500 hover:bg-green-50 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 font-semibold border border-gray-300 w-20 text-center">
                Post ID
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center">
                Author
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-left">
                Title
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center w-32">
                Image
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center w-20">
                Reporter ID
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center">
                Reporter
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center w-32">
                Reported At
              </th>
              <th className="p-2 font-semibold border border-gray-300 text-center w-[180px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center p-4 text-gray-500 border border-gray-300"
                >
                  No reported posts found.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr
                  key={`${item.postId}-${item.user.id}`}
                  className="hover:bg-gray-50"
                >
                  <td className="p-2 border border-gray-300 text-center">
                    {item.postId}
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    <Link
                      to={`/profile/${item.post.user?.username}`}
                      className="hover:underline"
                    >
                      {item.post.user?.username}
                    </Link>
                  </td>

                  <td className="p-2 border border-gray-300 text-left">
                    <Link
                      to={`/posts/${item.post.slug}`}
                      className="font-semibold hover:underline text-[15px] leading-snug line-clamp-2 block"
                    >
                      {formatTitle(item.post.title)}
                    </Link>
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    <img
                      src={item.post.coverImageUrl}
                      className="w-20 h-16 object-cover rounded inline-block"
                      alt="Post cover"
                    />
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    {item.userId}
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    <Link
                      to={`/profile/${item.user?.username}`}
                      className="hover:underline"
                    >
                      {item.user?.username}
                    </Link>
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td className="p-2 border border-gray-300 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleClearReport(item.postId, item.user.id)
                        }
                        className="px-3 py-1 border border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle size={16} /> Clear
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePost(item.postId, item.user.id)
                        }
                        className="px-3 py-1 border border-red-300 text-red-400 hover:bg-red-50 rounded cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FiTrash2 size={16} />
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
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded-full bg-white transition ${
            page === 1
              ? "invisible"
              : "cursor-pointer opacity-40 hover:opacity-60"
          }`}
        >
          Prev
        </button>

        <span className="px-3 py-1 opacity-70">{page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className={`px-3 py-1 rounded-full bg-white transition ${
            !hasNext
              ? "invisible"
              : "cursor-pointer opacity-40 hover:opacity-60"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
