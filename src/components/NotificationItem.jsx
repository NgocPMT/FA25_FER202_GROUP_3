import React from "react";

export default function NotificationItem({
  avatar,
  title,
  message,
  time,
  isLast,
  read,
}) {
  return (
    <div
      className={`flex items-start gap-3 px-6 py-4 cursor-pointer ${!isLast ? "border-b border-gray-200" : ""
        } ${read
          ? "bg-gray-100 text-gray-500" // Đã đọc 
          : "bg-amber-50 text-gray-900"  // Chưa đọc 
        } hover:bg-gray-200 transition`}
    >

      <img
        src={avatar}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-semibold hover:underline text-gray-800">
            {title}
          </span>{" "}
          <span>{message}</span>
        </p>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}
