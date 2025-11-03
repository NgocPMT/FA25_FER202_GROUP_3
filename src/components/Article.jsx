// Nhan
import React from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots } from "react-icons/bs";

export default function Article({ data }) {
  const {
    title,
    content,
    createdAt,
    coverImageUrl,
    user
  } = data;


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
  const fullText = extractTextRecursively(content).replace(/\s+/g, " ").trim();
  if (!fullText) return "...";
  return fullText.length > maxLength ? fullText.slice(0, maxLength) + "..." : fullText;
};


  return (
    <div className="flex justify-between items-start border-b border-gray-200 pb-6">
    
      {/* Left */}
      <div className="flex-1 pr-4">
        <p className="text-sm text-gray-600 mb-1">
          {user?.username ?? "Unknown Author"}
        </p>

        <h2 className="text-xl font-semibold mb-1 hover:underline cursor-pointer">
          {title}
        </h2>

        <p className="text-gray-600 mb-3 line-clamp-2">
          {getPreviewText(content)}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>

          {/* Fake stats */}
          <span className="flex items-center gap-1">
            <BsStarFill className="text-yellow-500" /> 
            {Math.floor(Math.random() * 1000)}
          </span>
          <span className="flex items-center gap-1">
            <BsChat /> {Math.floor(Math.random() * 50)}
          </span>

          <BsBookmark className="ml-auto cursor-pointer hover:text-black" />
          <BsThreeDots className="cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Right */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={title}
          className="w-36 h-24 object-cover rounded-md"
        />
      )}
    </div>
  );
}
