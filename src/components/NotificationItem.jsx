import React from "react";

export default function NotificationItem({
  avatar,
  message,
  time,
  isLast,
  read,
}) {
  const formatTime = (t) =>
    new Date(t).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div
      className={`flex items-start gap-3 px-6 py-4 cursor-pointer ${
        !isLast ? "border-b border-gray-200" : ""
      } ${
        read ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-gray-900"
      } hover:bg-gray-200 transition`}
    >
      <img
        src={
          avatar ||
          "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
        }
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{message}</p>

        <span className="text-xs text-gray-400">{formatTime(time)}</span>
      </div>
    </div>
  );
}
