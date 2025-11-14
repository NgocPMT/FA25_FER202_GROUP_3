import React, { useState, useEffect } from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots, BsBookmarkFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import ModalPortal from "./ModalPortal";
import { toast } from "react-toastify";

export default function Article({ data, isSaved, onSave, onDelete }) {
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

  //image
  const [isImageError, setIsImageError] = useState(false);

  // Menu for ThreeDots, Modal for delete button
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const extractTextRecursively = (node) => {
    if (!node) return "";

    // Nếu là text node
    if (typeof node.text === "string") return node.text;

    // Nếu có con, duyệt con
    if (Array.isArray(node.content)) {
      return node.content.map(extractTextRecursively).join(" ");
    }

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

  // delete post
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
        toast.error("Delete failed!")
        throw new Error(errorData.message || "Delete failed");
      }

      onDelete(postToDelete);
      toast.success("Deleted successfully!")
    } catch (err) {
      console.error("Delete post error:", err.message);
      toast.error("Delete failed!")
    } finally {
      setShowModal(false);
      setPostToDelete(null);
    }
  }


  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="pb-6 border-b border-gray-200 lg:mx-10 px-0">
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
        {/* LEFT */}
        <div className="flex-1 pr-4">
          <Link to={`/posts/${slug}`}>
            <h2
              className="text-base sm:text-lg md:text-[17px] lg:text-xl font-semibold mb-1 
        hover:underline cursor-pointer leading-snug 
        whitespace-pre-line break-words line-clamp-2"
            >
              {formatTitle(title)}
            </h2>
          </Link>

          <p className="text-gray-600 mb-3 line-clamp-2">
            {getPreviewText(content)}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>
            <span className="flex items-center gap-1">
              <BsStarFill className="text-yellow-500" /> {postReactions}
            </span>
            <span className="flex items-center gap-1">
              <BsChat /> {postComments}
            </span>
          </div>
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
              // if erro image or no image
              <div className="w-full h-full rounded-sm -ml-3 bg-transparent cursor-pointer" />
            )}
          </Link>
          <div className="hidden xl:flex absolute top-25 right-60 gap-3 text-gray-500">
            {isSaved ? (
              <BsBookmarkFill
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSave(data.id, isSaved);
                }}
              />
            ) : (
              <BsBookmark
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSave(data.id, isSaved);
                }}
              />
            )}
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
                <div className="absolute right-0 mt-2 ring ring-gray-300 rounded-sm shadow-lg bg-white p-2 z-20 flex flex-col gap-3">
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
                  <button className="w-full text-start text-nowrap text-red-600 hover:text-red-700 cursor-pointer">
                    Report
                  </button>
                </div>
              )}

              {/* show modal confirm */}
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
                          onClick={() => deletePost()}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </ModalPortal>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
