import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import CommentContent from "../components/CommentContent";
// import { Star, Flame, Gem } from "lucide-react";
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
  const commentListRef = useRef(null);

  const [openSort, setOpenSort] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [extraSpace, setExtraSpace] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [comments, setComments] = useState([]);
  const [sort, setSort] = useState("relevant");
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [user, setUser] = useState({
    id: "",
    name: "",
    avatar: "",
  });

  // Close comment menu (...)
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

  // last comment automatically scroll to the bottom
  useEffect(() => {
    if (extraSpace && commentListRef.current) {
      commentListRef.current.scrollTo({
        top: commentListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [extraSpace]);

  // Close Sort dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false);
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) setOpenSort(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Restore draft + extended state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !postId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setUser({
          id: data.userId || data.id || "",
          name: data.name || data.username || "User",
          avatar:
            data.avatarUrl ||
            "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp",
        });

        const userId = data.userId || data.id;
        if (!userId) return;

        const expandKey = `commentExpanded_${userId}_${postId}`;
        const draftKey = `commentDraft_${userId}_${postId}`;
        const timeKey = `${draftKey}_time`;

        const savedDraft = localStorage.getItem(draftKey);
        const savedTime = localStorage.getItem(timeKey);
        const savedExpanded = localStorage.getItem(expandKey);

        if (savedDraft && savedTime) {
          const diffHours =
            (Date.now() - parseInt(savedTime)) / (1000 * 60 * 60);

          if (diffHours < 12) {
            setCommentText(savedDraft);
            setIsExpanded(savedExpanded === "true");
            return;
          }
          localStorage.removeItem(draftKey);
          localStorage.removeItem(timeKey);
          localStorage.removeItem(expandKey);
        }

        setCommentText("");
        setIsExpanded(savedExpanded === "true");
      } catch (err) {
        console.error("❌ Error getting profile:", err);
      }
    };

    fetchProfile();
  }, [postId]);

  // Auto-save comment draft
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

  // // Lấy số bài viết của 1 user để hiển thị huy hiệu (Star/Flame/Gem)
  // const fetchPostCount = async (userId) => {
  //   try {
  //     const res = await fetch(
  //       `${import.meta.env.VITE_API_URL}/users/user/${userId}/posts`
  //     );

  //     const data = await res.json();

  //     const posts = Array.isArray(data) ? data : data.posts || [];

  //     return posts.length;
  //   } catch (err) {
  //     console.warn("⚠️ Error fetching post count:", err);
  //     return 0;
  //   }
  // };

  // Get the list of comments, put the newest comment at the top
  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`
      );
      const data = await res.json();
      // console.log("🔥 Comments data:", data);

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

        // const users = [...new Set(reordered.map((c) => c.user.id))];

        // const counts = {};
        // for (const id of users) {
        //   counts[id] = await fetchPostCount(id);
        // }

        // const withPostCount = reordered.map((c) => ({
        //   ...c,
        //   user: {
        //     ...c.user,
        //     postCount: counts[c.user.id] || 0,
        //   },
        // }));

        // setComments(withPostCount);
        setComments(reordered);
        setSort("relevant");
      }
    } catch (err) {
      console.warn("⚠️ Error when getting comment:", err);
    }
  };

  // open comment fetch latest comments
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  // Reset textarea expansion animation when opening comment
  useEffect(() => {
    if (isOpen && isExpanded) {
      setIsExpanded(false);
      const timer = setTimeout(() => setIsExpanded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Create or update a comment
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

  // Delete comment
  const handleDelete = async () => {
    if (!targetDeleteId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to delete.");
      return;
    }

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

      if (!res.ok) {
        toast.error("Failed to delete comment.");
        throw new Error("Comment cannot be deleted.");
      }

      setComments((prev) => prev.filter((c) => c.id !== targetDeleteId));
      setShowDeleteModal(false);

      if (onCommentChange) {
        onCommentChange("delete", targetDeleteId);
      }

      toast.success("Comment deleted successfully!");
    } catch (err) {
      toast.error("Delete failed, please try again.");
      console.error(err);
    } finally {
      setDeleting(false);
      setTargetDeleteId(null);
    }
  };

  // Comment time format
  const formatDate = (comment) => {
    const d = new Date(comment.createdAt || comment.date);
    const now = new Date();
    const diffTime = Math.max(0, now - d);

    const diffMinutes = diffTime / (1000 * 60);
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      const m = Math.floor(diffMinutes);
      return m === 1 ? "1 minute ago" : `${m} minutes ago`;
    }

    if (diffHours < 24) {
      const h = Math.floor(diffHours);
      return h === 1 ? "1 hour ago" : `${h} hours ago`;
    }

    if (diffDays < 2) {
      const d = Math.floor(diffDays);
      return d === 1 ? "1 day ago" : `${d} days ago`;
    }

    return `${d.getDate()} Th${d.getMonth() + 1}`;
  };

  // Sort comments
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
      {/* overlay comment */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 bg-black/10 z-40 cursor-pointer ${
          isOpen ? " opacity-100 visible" : "opacity-0 invisible"
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
            <div className="relative  p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Responses ({comments.filter((c) => c && c.id).length})
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

            {/* Sort comment */}
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

            {/* List of comments */}
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

                  const isOwner = String(user.id) === String(c.user?.id);

                  const isAuthorComment =
                    String(c.user?.id) === String(postAuthorId);

                  const isAuthorOfPost =
                    String(user.id) === String(postAuthorId);

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-lg ${
                        isAuthorComment ? "text-black" : "text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start gap-2">
                          <Link
                            to={`/profile/${
                              c.user?.username || c.user?.id || c.user?.userId
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={displayAvatar}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border border-white mt-0.5 cursor-pointer"
                            />
                          </Link>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/profile/${
                                  c.user?.username ||
                                  c.user?.id ||
                                  c.user?.userId
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:underline"
                              >
                                <p className="text-sm font-semibold cursor-pointer">
                                  {displayName}
                                </p>
                              </Link>

                              {isOwner && !isAuthorOfPost && (
                                <span className="text-xs bg-gray-200 text-gray-500 px-1 py-0.4 rounded-md">
                                  You
                                </span>
                              )}

                              {isOwner && isAuthorOfPost && (
                                <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-md">
                                  Author
                                </span>
                              )}

                              {!isOwner && isAuthorComment && (
                                <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-md">
                                  Author
                                </span>
                              )}

                              {/* {c.user?.postCount >= 15 && (
                                <Gem className="w-4 h-4 text-blue-500" />
                              )}

                              {c.user?.postCount >= 10 &&
                                c.user?.postCount < 15 && (
                                  <Flame className="w-4 h-4 text-red-500" />
                                )}

                              {c.user?.postCount >= 5 &&
                                c.user?.postCount < 10 && (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )} */}
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                              {formatDate(c)}

                              {c.updatedAt && c.updatedAt !== c.createdAt && (
                                <span className="text-gray-400">(edited)</span>
                              )}
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

                      {/* Comment content */}
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
                    deleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
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
