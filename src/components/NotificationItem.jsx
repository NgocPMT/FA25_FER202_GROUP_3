import React from "react";

export default function NotificationItem({ avatar, title, message, time, isLast }) {
  return (
    <div
      className={`flex items-start gap-3 px-6 py-4 cursor-pointer ${
        !isLast ? "border-b border-gray-200" : ""
      } hover:bg-gray-50 transition`}
    >
      <img
        src={avatar}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold hover:underline">{title}</span>{" "}
          <span className="text-gray-600">{message}</span>
        </p>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}
