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
  // NEW: check if current user is publication owner
  const [isPublicationOwner, setIsPublicationOwner] = useState(false);

  useEffect(() => {
    async function checkOwner() {
      if (!data.publication) return setIsPublicationOwner(false);
      const token = localStorage.getItem("token");
      if (!token) return setIsPublicationOwner(false);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/validate-owner/${data.publication.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );


        if (!res.ok) return setIsPublicationOwner(false);

        const dt = await res.json();
        setIsPublicationOwner(dt?.isOwner === true);
      } catch {
        setIsPublicationOwner(false);
      }
    }

    checkOwner();
  }, [data.publication]);



  // CONFIRM APPROVE / REJECT
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    action: null, // "approve" | "reject"
    postId: null,
    slug: null,
  });

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
      let deleteUrl;

      // Nếu là publication owner → dùng API delete trong publication
      if (isPublicationOwner && data.publication) {
        deleteUrl = `${import.meta.env.VITE_API_URL}/publications/${data.publication.id}/posts/${postToDelete}`;
      }
      else {
        // ngược lại → xóa bài cá nhân
        deleteUrl = `${import.meta.env.VITE_API_URL}/posts/${postToDelete}`;
      }

      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      onDelete(postToDelete);
      toast.success("Deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Delete failed!");
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

  const canDelete =
    currentUserId === user?.id ||
    isPublicationOwner;


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
            <>
              {/* Avatar Publication (clickable) */}
              <Link to={`/publications/${data.publication.id}`}>
                <img
                  src={
                    data.publication.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt="publication"
                  className="w-5 h-5 object-cover"
                />
              </Link>

              <span className="text-sm text-gray-800">
                In{" "}
                <Link
                  to={`/publications/${data.publication.id}`}
                  className="hover:underline font-medium"
                >
                  {data.publication.name}
                </Link>
                {" "}by{" "}
                <Link
                  to={`/profile/${user?.username ?? "unknown"}`}
                  className="hover:underline font-medium"
                >
                  {user?.Profile?.name ?? "Unknown Author"}
                </Link>
              </span>
            </>
          ) : (
            <>
              <Link to={`/profile/${user?.username ?? "unknown"}`}>
                <img
                  src={
                    user?.Profile?.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  alt="author"
                  className="w-5 h-5 object-cover rounded-full"
                />
              </Link>

              <span className="text-sm text-gray-600">
                <Link
                  to={`/profile/${user?.username ?? "unknown"}`}
                  className="hover:underline font-medium"
                >
                  {user?.Profile?.name ?? "Unknown Author"}
                </Link>
              </span>
            </>
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
                  onClick={() =>
                    setConfirmAction({
                      show: true,
                      action: "approve",
                      postId: id,
                      slug,
                    })
                  }
                >
                  <BsCheckCircle size={18} />
                  Approve
                </button>

                <button
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() =>
                    setConfirmAction({
                      show: true,
                      action: "reject",
                      postId: id,
                    })
                  }
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
                      {canDelete && (
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

                      {currentUserId !== user?.id && (
                        <button
                          className="w-full text-start text-nowrap text-red-600 hover:text-red-700 cursor-pointer"
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
      {/* ======================= APPROVE / REJECT MODAL ======================= */}
      {confirmAction.show && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 w-80 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-3">
                {confirmAction.action === "approve"
                  ? "Approve this post?"
                  : "Reject this post?"}
              </h3>

              <p className="text-sm text-gray-600 mb-5">
                {confirmAction.action === "approve"
                  ? "This post will be published inside the publication."
                  : "This post will be rejected and removed from the pending list."}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setConfirmAction({ show: false, action: null, postId: null, slug: null })
                  }
                  className="px-4 py-2 text-gray-600 hover:text-black"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (confirmAction.action === "approve") {
                      onApprove(confirmAction.postId, confirmAction.slug);
                    } else {
                      onReject(confirmAction.postId);
                    }
                    setConfirmAction({ show: false, action: null, postId: null, slug: null });
                  }}
                  className={`px-4 py-2 text-white rounded ${confirmAction.action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
