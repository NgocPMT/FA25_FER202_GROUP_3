import React, { useState, useEffect } from "react";
import {
  BsStarFill,
  BsChat,
  BsBookmark,
  BsThreeDots,
  BsBookmarkFill,
  BsCheckCircle,
  BsXCircle
} from "react-icons/bs";
import { Link } from "react-router-dom";
import ModalPortal from "./ModalPortal";
import { toast } from "react-toastify";
import SaveToReadingListModal from "./SaveToReadingListModal";

export default function Article({
  data,
  isSaved,
  onSave,
  onDelete,
  mode,
  onApprove,
  onReject,
}) {
  console.log("ARTICLE DATA RECEIVED:", data);
  const currentUserId = JSON.parse(localStorage.getItem("userId"));


  const {
    id,
    title,
    content,
    createdAt,
    coverImageUrl,
    user,
    PostReaction,
    comments,
    slug,
  } = data;

  const postReactions = PostReaction?.length || 0;
  const postComments = comments?.length || 0;

  const [isImageError, setIsImageError] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  // For save post
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isReadingListMode = mode === "reading-list";

  const extractTextRecursively = (node) => {
    if (!node) return "";
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.content))
      return node.content.map(extractTextRecursively).join(" ");
    return "";
  };

  const getPreviewText = (content, maxLength = 60) => {
    if (!content) return "...";
    const fullText = extractTextRecursively(content)
      .replace(/\s+/g, " ")
      .trim();
    if (!fullText) return "...";
    return fullText.length > maxLength
      ? fullText.slice(0, maxLength) + "..."
      : fullText;
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

  // DELETE POST
  async function deletePost() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Delete failed!");
        throw new Error(errorData.message || "Delete failed");
      }

      onDelete(postToDelete);
      toast.success("Deleted successfully!");
    } catch (err) {
      toast.error("Delete failed!");
    } finally {
      setShowModal(false);
      setPostToDelete(null);
    }
  }

  // REPORT POST
  async function reportPost() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reported-posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: postToReport }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      const data = await res.json();
      toast.success(data.message);
    } catch (err) {
      toast.error("Failed to report!");
    } finally {
      setShowReportModal(false);
      setPostToReport(null);
    }
  }

  useEffect(() => {
    const closeMenu = () => setShowMenu(false);
    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, []);

  return (
    <>
      <div
        className={
          "pb-6 border-b border-gray-200 px-0 " +
          (mode === "publication-pending" || mode === "publication-post"
            ? "lg:mx-0"
            : "lg:mx-10")
        }
      >

        {/* AUTHOR / PUBLICATION HEADER */}
        <div className="flex items-center gap-2 mb-2">

          {data.publication ? (
            // ---------- BÀI THUỘC PUBLICATION ----------
            <Link
              to={`/publications/${data.publication.id}`}
              className="flex items-center gap-2 hover:underline"
            >
              {/* Avatar publication */}
              <img
                src={
                  data.publication.avatarUrl ||
                  "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                }
                alt="publication"
                className="w-5 h-5 object-cover rounded-full"
              />

              <div className="flex flex-col leading-tight">
                {/* In Publication Name */}
                <span className="text-sm text-gray-800 font-medium">
                  In {data.publication.name}
                </span>

                {/* by Author Name */}
                <span className="text-xs text-gray-500">
                  by {user?.Profile?.name ?? "Unknown"}
                </span>
              </div>
            </Link>
          ) : (
            // ---------- BÀI ĐĂNG CÁ NHÂN ----------
            <Link
              to={`/profile/${user?.username ?? "unknown"}`}
              className="flex items-center gap-2 hover:underline"
            >
              <img
                src={
                  user?.Profile?.avatarUrl ||
                  "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                }
                alt="author"
                className="w-5 h-5 object-cover rounded-full"
              />

              <span className="text-sm text-gray-600 font-medium">
                {user?.Profile?.name ?? "Unknown Author"}
              </span>
            </Link>
          )}

        </div>


        <div className="flex justify-between items-start">
          {/* LEFT */}
          <div className="flex-1 pr-4">
            <Link to={`/posts/${slug}`}>
              <h2 className="text-base sm:text-lg md:text-[17px] lg:text-xl font-semibold mb-1 hover:underline cursor-pointer leading-snug whitespace-pre-line break-words line-clamp-2">
                {formatTitle(title)}
              </h2>
            </Link>

            <p className="text-gray-600 mb-3 line-clamp-2">
              {getPreviewText(content)}
            </p>

            {/* REACTIONS */}
            {mode !== "publication-pending" && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>
                <span className="flex items-center gap-1">
                  <BsStarFill className="text-yellow-500" /> {postReactions}
                </span>
                <span className="flex items-center gap-1">
                  <BsChat /> {postComments}
                </span>
              </div>
            )}

            {/* APPROVE / REJECT */}
            {mode === "publication-pending" && (
              <div className="flex gap-3 mt-4">
                <button
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => onApprove(id, slug)}
                >
                  <BsCheckCircle size={18} />
                  Approve
                </button>

                <button
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onReject(id)}
                >
                  <BsXCircle size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
          {/* RIGHT */}
          <div className="relative flex-shrink-0">
            <Link
              to={`/posts/${slug}`}
              className="block relative w-[90px] h-[60px] sm:w-40 sm:h-[100px] lg:w-40 lg:h-[100px]"
            >
              {!isImageError && coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt={title}
                  className="object-cover rounded-sm -ml-3 w-full h-full hover:opacity-90 transition"
                  onError={() => setIsImageError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-sm -ml-3 bg-transparent cursor-pointer" />
              )}
            </Link>

            {!isReadingListMode && mode !== "publication-pending" && (
              <div className="hidden xl:flex absolute top-25 right-60 gap-3 text-gray-500">
                <BsBookmark
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowSaveModal(true);
                  }}
                />
                {showSaveModal && (
                  <ModalPortal>
                    <SaveToReadingListModal
                      postId={data.id}
                      onClose={() => setShowSaveModal(false)}
                    />
                  </ModalPortal>
                )}

                {/* THREE DOTS */}
                <div className="relative">
                  <BsThreeDots
                    className="cursor-pointer hover:text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowMenu((prev) => !prev);
                    }}
                  />

                  {showMenu && (
                    <div
                      className="absolute right-0 mt-2 ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 z-20 flex flex-col gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {currentUserId === user?.id && (
                        <button
                          className="w-full text-start text-nowrap cursor-pointer text-gray-600 hover:text-black"
                          onClick={() => {
                            setPostToDelete(id);
                            setShowModal(true);
                          }}
                        >
                          Delete
                        </button>
                      )}

                      <button
                        className="w-full text-start text-nowrap text-red-600 hover:text-red-700 cursor-pointer"
                        onClick={() => {
                          setPostToReport(data.id);
                          setShowReportModal(true);
                        }}
                      >
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================= DELETE MODAL ======================= */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Delete Confirm
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure to delete this post?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-black"
                >
                  Back
                </button>

                <button
                  onClick={deletePost}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ======================= REPORT MODAL ======================= */}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999]">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Report Post
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to report this post?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Cancel
              </button>

              <button
                onClick={reportPost}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
