import React from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function Article({ data }) {
  const {
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
    if (title.length <= 80) {
      return (
        <>
          {title.slice(0, 50)}
          <br />
          {title.slice(50)}
        </>
      );
    }
    return (
      <>
        {title.slice(0, 100)}
        ...
      </>
    );
  };






  return (
    <div className="flex justify-between items-start border-b border-gray-200 pb-6">

      {/* Left */}
      <div className="flex-1 pr-4">
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
        <Link to={`/posts/${slug}`}>
          <h2
            className="
    text-xl font-semibold mb-1 hover:underline cursor-pointer
    break-words leading-snug max-w-[500px]
  "
          >
            {formatTitle(title)}
          </h2>
        </Link>




        <p className="text-gray-600 mb-3 line-clamp-2">
          {getPreviewText(content)}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>

          {/* stats */}
          <span className="flex items-center gap-1">
            <BsStarFill className="text-yellow-500" />
            {postReactions}
          </span>
          <span className="flex items-center gap-1">
            <BsChat /> {postComments}
          </span>

        </div>
      </div>

      {/* Right */}
      <div className="relative">
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-36 h-24 object-cover rounded-md -ml-3"
          />
        )}
        <div className="hidden xl:flex absolute top-25 right-60 gap-3 text-gray-500">
          <BsBookmark className="cursor-pointer hover:text-black" />
          <BsThreeDots className="cursor-pointer hover:text-black" />
        </div>

      </div>

    </div>
  );
}
