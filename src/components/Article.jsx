import React, { useState, useEffect } from "react";
import {
  BsStarFill,
  BsChat,
  BsBookmark,
  BsThreeDots,
  BsBookmarkFill,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import ModalPortal from "./ModalPortal";
import { toast } from "react-toastify";

export default function Article({
  data,
  isSaved,
  onSave,
  onDelete,
  mode = "default", // default hoặc "publication-pending"
  onApprove,
  onReject,
}) {
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

  const extractTextRecursively = (node) => {
    if (!node) return "";
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map(extractTextRecursively).join(" ");
    }
    return "";
  };

  const isPendingMode = mode === "publication-pending";
  const isDefaultMode = mode === "default";

  // DELETE (default mode)
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

      onDelete?.(postToDelete);
      toast.success("Deleted successfully!");
    } catch (err) {
      toast.error("Delete failed!");
    } finally {
      setShowModal(false);
      setPostToDelete(null);
    }
  }

  // REPORT post
  async function reportPost() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reported-posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ postId: postToReport }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      const data = await res.json();
      toast.success(data.message);
    } catch (err) {
      toast.error(`Failed to report: ${err.message}`);
    } finally {
      setShowReportModal(false);
      setPostToReport(null);
    }
  }

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="pb-6 border-b border-gray-200 lg:mx-10 px-0">
      {/* AUTHOR */}
      <div className="flex items-center gap-2 mb-2">
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
          <span className="text-sm text-gray-600">
            {user?.Profile?.name ?? "Unknown Author"}
          </span>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        {/* LEFT BLOCK */}
        <div className="flex-1 pr-4">

          {/* TITLE */}
          {isPendingMode ? (
            <h2 className="text-xl font-semibold mb-3 whitespace-pre-line break-words">
              {title}
            </h2>
          ) : (
            <Link to={`/posts/${slug}`}>
              <h2 className="text-base sm:text-lg md:text-[17px] lg:text-xl font-semibold mb-1 
                hover:underline cursor-pointer leading-snug 
                whitespace-pre-line break-words line-clamp-2"
              >
                {title}
              </h2>
            </Link>
          )}

          {/* CONTENT */}
          {isPendingMode ? (
            <div className="text-gray-700 mb-4 whitespace-pre-line break-words">
              {extractTextRecursively(content)}
            </div>
          ) : (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {extractTextRecursively(content).slice(0, 100) + "..."}
            </p>
          )}

          {/* CREATED DATE ONLY (pending mode) */}
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString("vi-VN")}
          </span>

          {/* APPROVE + REJECT (pending mode) */}
          {isPendingMode && (
            <div className="flex gap-3 mt-4">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                onClick={() => onApprove?.(id, slug)}
              >
                Approve
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                onClick={() => {
                  setPostToDelete(id);
                  setShowModal(true);
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* RIGHT BLOCK (IMAGE) */}
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
              <div className="w-full h-full rounded-sm -ml-3 bg-transparent"></div>
            )}
          </Link>

          {/* MENU 3 CHẤM (chỉ default) */}
          {isDefaultMode && (
            <div className="hidden xl:flex absolute top-25 right-60 gap-3 text-gray-500">
              {isSaved ? (
                <BsBookmarkFill
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onSave?.(data.id, isSaved);
                  }}
                />
              ) : (
                <BsBookmark
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onSave?.(data.id, isSaved);
                  }}
                />
              )}

              <div className="relative">
                <BsThreeDots
                  className="cursor-pointer hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowMenu((p) => !p);
                  }}
                />

                {showMenu && (
                  <div className="absolute right-0 mt-2 ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 z-20 flex flex-col gap-3">
                    {currentUserId === user?.id && (
                      <button
                        className="w-full text-start cursor-pointer text-gray-600 hover:text-black"
                        onClick={() => {
                          setPostToDelete(id);
                          setShowModal(true);
                        }}
                      >
                        Delete
                      </button>
                    )}

                    {currentUserId !== user?.id && (
                      <button
                        className="w-full text-start text-red-600 hover:text-red-700 cursor-pointer"
                        onClick={() => {
                          setPostToReport(data.id);
                          setShowReportModal(true);
                        }}
                      >
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REJECT / DELETE MODAL */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                {isPendingMode ? "Reject Confirm" : "Delete Confirm"}
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                {isPendingMode
                  ? "Are you sure to reject this post?"
                  : "Are you sure to delete this post?"}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-black"
                >
                  Back
                </button>

                <button
                  onClick={async () => {
                    if (isPendingMode) {
                      onReject?.(postToDelete);
                      setShowModal(false);
                      setPostToDelete(null);
                    } else {
                      await deletePost();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {isPendingMode ? "Reject" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* REPORT MODAL */}
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
    </div>
  );
}
