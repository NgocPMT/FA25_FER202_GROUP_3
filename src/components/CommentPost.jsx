import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommentContent from "../components/CommentContent";
import "../css/Comment.css";

export default function CommentPost({
  isOpen,
  onClose,
  postId,
  postAuthorId,
  onCommentChange,
}) {
  const textareaRef = useRef(null);
  const sortRef = useRef(null);
  const [openSort, setOpenSort] = useState(false);
  const [comments, setComments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sort, setSort] = useState("relevant");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [extraSpace, setExtraSpace] = useState(false);
  const commentListRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState({
    id: "",
    name: "",
    avatar: "",
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-comment")) {
        setOpenMenuId(null);
        setExtraSpace(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (extraSpace && commentListRef.current) {
      commentListRef.current.scrollTo({
        top: commentListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [extraSpace]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false);
      }
    }
    function handleVisibilityChange() {
      if (document.hidden) setOpenSort(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // phục hồi dữ liệu nháp
  useEffect(() => {
    localStorage.setItem("testDraft", "Test comment content");
    console.log(localStorage.getItem("testDraft"));

    const token = localStorage.getItem("token");
    if (!token || !postId) return;
    console.log("Post ID:", postId);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        console.log("🧍‍♂️ Profile data:", data);

        // ✅ Cập nhật thông tin user
        setUser({
          id: data.userId || data.id || "",
          name: data.name || data.username || "User",
          avatar:
            data.avatarUrl ||
            "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp",
        });

        // ✅ Bảo vệ: chỉ xử lý khi có userId
        const userId = data.userId || data.id;
        if (!userId) {
          console.warn("⚠️ Missing userId, skip draft restore");
          return;
        }

        // ✅ Tạo key cố định
        const expandKey = `commentExpanded_${userId}_${postId}`;
        const draftKey = `commentDraft_${userId}_${postId}`;
        const timeKey = `${draftKey}_time`;

        const savedExpanded = localStorage.getItem(expandKey);
        const savedDraft = localStorage.getItem(draftKey);
        const savedTime = localStorage.getItem(timeKey);

        console.log("🎯 Draft key:", draftKey, "=>", savedDraft);

        // ✅ Có draft hợp lệ → khôi phục
        if (savedDraft && savedTime) {
          const diffHours =
            (Date.now() - parseInt(savedTime)) / (1000 * 60 * 60);
          if (diffHours < 12) {
            setCommentText(savedDraft);

            if (savedExpanded === "true") {
              setIsExpanded(false);
              setTimeout(() => setIsExpanded(true), 50);
            } else {
              setIsExpanded(false);
            }
            return; // ✅ Dừng ở đây, không reset nữa
          } else {
            // ✅ Quá 12 tiếng thì mới xóa
            localStorage.removeItem(draftKey);
            localStorage.removeItem(timeKey);
            localStorage.removeItem(expandKey);
          }
        }

        // ❗ Nếu không có draft hợp lệ thì chỉ reset state, không xóa localStorage lung tung
        setCommentText("");
        setIsExpanded(savedExpanded === "true");
      } catch (err) {
        console.error("❌ Error getting profile:", err);
      }
    };

    fetchProfile();
  }, [postId]);

  // Lưu bản nháp người dùng nhập
  useEffect(() => {
    if (!user?.id || !postId) return;
    const draftKey = `commentDraft_${user.id}_${postId}`;
    const timeout = setTimeout(() => {
      if (commentText.trim()) {
        localStorage.setItem(draftKey, commentText);
        localStorage.setItem(`${draftKey}_time`, Date.now().toString());
      } else {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(`${draftKey}_time`);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [commentText, user, postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`
      );
      const data = await res.json();
      console.log("🔥 Comments data:", data);

      if (Array.isArray(data)) {
        const cleanedData = data.map((c) => ({
          ...c,
          user: c.user || { name: "Anonymous" },
        }));

        const latestComment = cleanedData.reduce((latest, current) => {
          return new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest;
        }, cleanedData[0]);

        const reordered = [
          latestComment,
          ...cleanedData.filter((c) => c.id !== latestComment.id),
        ];

        setComments(reordered);
        setSort("relevant");
      }
    } catch (err) {
      console.warn("⚠️ Error when getting comment:", err);
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  useEffect(() => {
    if (isOpen && isExpanded) {
      setIsExpanded(false);
      const timer = setTimeout(() => setIsExpanded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Tạo hoặc cập nhật comment
  const handleRespond = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("⚠️ You must log in to comment.");

    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`;
      let method = "POST";
      if (editingId) {
        url = `${url}/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (!res.ok) throw new Error("Comments cannot be submitted.");
      const createdOrUpdated = await res.json();
      const newComment = createdOrUpdated.comment || createdOrUpdated;
      if (!newComment.user) {
        newComment.user = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatar,
        };
      }

      if (editingId) {
        setComments((prev) =>
          prev.map((c) => (c.id === editingId ? newComment : c))
        );
        setEditingId(null);
      } else {
        setComments((prev) => [newComment, ...prev]);
      }

      if (onCommentChange) {
        onCommentChange(editingId ? "update" : "add", newComment.id);
      }

      setCommentText("");

      const draftKey = `commentDraft_${user.id}_${postId}`;
      localStorage.removeItem(draftKey);
      localStorage.removeItem(`${draftKey}_time`);
    } catch (err) {
      console.error("❌ Error sending comment:", err);
      alert("Comment could not be submitted. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!targetDeleteId) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("⚠️ You need to log in to delete.");

    setDeleting(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/posts/${postId}/comments/${targetDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Comment cannot be deleted.");

      setComments((prev) => prev.filter((c) => c.id !== targetDeleteId));
      setShowDeleteModal(false);

      if (onCommentChange) {
        onCommentChange("delete", targetDeleteId);
      }
    } catch (err) {
      alert("⚠️ Delete failed, please try again.");
    } finally {
      setDeleting(false);
      setTargetDeleteId(null);
    }
  };

  const formatDate = (comment) => {
    const d = new Date(comment.createdAt || comment.date);
    const now = new Date();
    const diffTime = now - d;

    const diffMinutes = diffTime / (1000 * 60);
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffMinutes < 60) {
      return `${Math.floor(diffMinutes)} minutes ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hour ago`;
    } else if (diffDays < 2) {
      return `${Math.floor(diffDays)} day ago`;
    } else {
      return `${d.getDate()} Th${d.getMonth() + 1}`;
    }
  };

  useEffect(() => {
    const sortedComments = [...comments].sort((a, b) => {
      if (sort === "recent") {
        return (
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
      } else if (sort === "relevant") {
        const latestComment = [...comments].sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        )[0];

        if (a === latestComment) return -1;
        if (b === latestComment) return 1;

        return (
          new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)
        );
      }
      return 0;
    });

    setComments(sortedComments);
  }, [sort]);

  return (
    <>
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 bg-black/10 z-40 cursor-pointer ${
          isOpen ? "visible" : "invisible"
        }`}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="comment-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="relative p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Responses ({comments ? comments.length : 0}){" "}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[91%] border-b border-gray-300"></div>
            </div>

            <div className="p-4 relative overflow-visible">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    user.avatar ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt="avatar"
                  className="size-9 rounded-full object-cover"
                />
                <p className="text-sm font-semibold">{user.name}</p>
              </div>

              <motion.div
                initial={false}
                animate={{ height: isExpanded ? 140 : 46 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="border border-gray-300 bg-gray-50 rounded-md p-3 transition-all hover:bg-gray-100"
                onClick={() => {
                  if (!isExpanded) {
                    setIsExpanded(true);
                    const expandKey = `commentExpanded_${user.id}_${postId}`;
                    localStorage.setItem(expandKey, "true");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full resize-none text-sm outline-none bg-transparent"
                  rows={3}
                />

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-end gap-4 mt-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsExpanded(false);
                          setCommentText("");
                          const expandKey = `commentExpanded_${user.id}_${postId}`;
                          localStorage.removeItem(expandKey);
                        }}
                        className="text-gray-500 text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!commentText.trim() || loading}
                        onClick={handleRespond}
                        className={`text-white text-sm px-4 py-1.5 border rounded-full ${
                          commentText.trim()
                            ? "bg-black hover:opacity-80 cursor-pointer"
                            : "bg-gray-300"
                        }`}
                      >
                        {loading
                          ? editingId
                            ? "Updating..."
                            : "Sending..."
                          : editingId
                          ? "Update"
                          : "Respond"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="p-4 border-b border-gray-300 relative z-10">
              <div className="flex items-center justify-between">
                <div ref={sortRef} className="relative text-left">
                  <button
                    onClick={() => setOpenSort((prev) => !prev)}
                    className="inline-flex items-center justify-between w-44 px-4 py-2 text-sm font-semibold bg-white text-gray-700 transition cursor-pointer"
                  >
                    {sort === "relevant" ? "Most relevant" : "Most recent"}
                    <svg
                      className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
                        openSort ? "rotate-180" : "rotate-0"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openSort && (
                    <div className="absolute right-0 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/10 z-20 w-44">
                      <ul className="py-1 text-sm text-gray-700">
                        {[
                          { label: "Most relevant", value: "relevant" },
                          { label: "Most recent", value: "recent" },
                        ].map((option) => (
                          <li key={option.value}>
                            <button
                              onClick={() => {
                                setSort(option.value);
                                setOpenSort(false);
                              }}
                              className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition ${
                                sort === option.value
                                  ? "bg-white text-gray-900 font-medium hover:bg-gray-100"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <span>{option.label}</span>
                              {sort === option.value && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4 text-black"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* lấy id comment */}
            <div
              ref={commentListRef}
              className={`flex-1 overflow-y-auto px-4 py-3 space-y-5 transition-all duration-300 ${
                extraSpace ? "pb-24" : "pb-4"
              }`}
            >
              {comments
                .filter((c) => c && c.id)
                .map((c) => {
                  if (!c.id) {
                    console.warn("⚠️ Comment missing id:", c);
                    return null;
                  }
                  const displayName =
                    c.user?.Profile?.name ||
                    c.user?.name ||
                    c.user?.username ||
                    "Anonymous";

                  const displayAvatar =
                    c.user?.Profile?.avatarUrl ||
                    c.user?.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp";

                  const isOwner =
                    String(user.id) === String(c.user?.id) ||
                    String(user.id) === String(c.user?.userId) ||
                    String(user.id) === String(c.user?.Profile?.userId);

                  const isAuthorComment =
                    String(c.user?.id) === String(postAuthorId) ||
                    String(c.user?.userId) === String(postAuthorId);

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-lg ${
                        isAuthorComment
                          ? "text-black"
                          : "bg-gray-50 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start gap-2">
                          <img
                            src={displayAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border border-white mt-0.5"
                          />

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">
                                {displayName}
                              </p>
                              {isAuthorComment && (
                                <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-md">
                                  Author
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {formatDate(c)}
                            </span>
                          </div>
                        </div>

                        <div className="relative menu-comment">
                          <button
                            onClick={() => {
                              const newId = openMenuId === c.id ? null : c.id;
                              setOpenMenuId(newId);

                              const isLastComment =
                                comments[comments.length - 1]?.id === c.id;
                              setExtraSpace(
                                newId && isLastComment ? true : false
                              );
                            }}
                            className="text-gray-500 hover:text-black px-2 cursor-pointer"
                          >
                            ...
                          </button>

                          {openMenuId === c.id && (
                            <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40 animate-fadeIn">
                              {isOwner ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingId(c.id);
                                      setCommentText(c.content);
                                      setIsExpanded(true);
                                      setTimeout(
                                        () => textareaRef.current?.focus(),
                                        50
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Edit respond
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setTargetDeleteId(c.id);
                                      setShowDeleteModal(true);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                  >
                                    Delete respond
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      // console.log("🚩 Report comment:", c.id);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                  >
                                    Report respond
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nội dung comment */}
                      <div className="mb-3">
                        <CommentContent
                          content={c.content}
                          showFull={c.showFull}
                          onExpand={() =>
                            setComments((prev) =>
                              prev.map((item) =>
                                item.id === c.id
                                  ? { ...item, showFull: true }
                                  : item
                              )
                            )
                          }
                        />
                      </div>

                      {/* Footer replies */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        {c.repliesCount > 0 && (
                          <span>{c.repliesCount} replies</span>
                        )}

                        <button className="underline ml-1 hover:text-gray-700 cursor-pointer">
                          Reply
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Delete comment?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`px-4 py-2 text-sm rounded-lg text-white transition ${
                    deleting
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
