import React from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots, BsBookmarkFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios'

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
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(postToDelete);
    } catch (err) {
      console.error("Delete post error:", err.response?.data || err.message);
    } finally {
      setShowModal(false);
      setPostToDelete(null)
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
    <div className="flex justify-between items-end border-b border-gray-200 pb-6">

      {/* LEFT: CONTENT + BUTTONS */}
      <div className="flex-1 pr-4 flex flex-col justify-between">
        {/* User info */}
        <div className="flex items-center gap-2 mb-1">
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

        {/* Title + content */}
        <Link to={`/posts/${slug}`}>
          <h2
            className="text-base sm:text-lg md:text-[17px] lg:text-xl font-semibold mb-1 
          hover:underline cursor-pointer leading-snug 
          whitespace-pre-line break-words line-clamp-2 
          max-w-full sm:max-w-[300px] md:max-w-[400px] lg:max-w-[600px]"
          >
            {formatTitle(title)}
          </h2>
        </Link>

        <p className="text-gray-600 mb-3 line-clamp-2">
          {getPreviewText(content)}
        </p>

        {/* Date + stats + buttons */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">

          {/* Left side: date + stats */}
          <div className="flex items-center gap-4">
            <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>
            <span className="flex items-center gap-1">
              <BsStarFill className="text-yellow-500" />
              {postReactions}
            </span>
            <span className="flex items-center gap-1">
              <BsChat /> {postComments}
            </span>
          </div>

          {/* Right side: buttons */}
          <div className="px-3 flex items-center gap-3 text-gray-500">
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
              )}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: IMAGE OR PLACEHOLDER */}
      <div className="min-w-[150px]">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-36 h-24 object-cover rounded-md"
          />
        ) : (
          <div className="w-36 h-24 bg-gray-100 rounded-md"></div>
        )}
      </div>
    </div>
  );
}
