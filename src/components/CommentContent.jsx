import React from "react";
import "../css/Comment.css";

export default function CommentContent({ content, showFull, onExpand }) {
  const maxChars = 170; // Giới hạn ký tự
  const needsTruncate = content && content.length > maxChars; // Kiểm tra nếu content tồn tại và có độ dài lớn hơn maxChars

  if (!needsTruncate) {
    return (
      <div className="comment-wrapper text-gray-800 text-sm mb-1">
        {content}
      </div>
    );
  }

  const truncated = showFull
    ? content
    : content.slice(0, maxChars).trimEnd() + "...";

  return (
    <div className="comment-wrapper text-gray-800 text-sm mb-1">
      <span>
        {truncated}
        {!showFull && (
          <span className="more-inline " onClick={onExpand}>
            more
          </span>
        )}
      </span>
    </div>
  );
}
