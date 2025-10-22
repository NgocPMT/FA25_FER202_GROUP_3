import React, { useState } from "react";
import NotificationItem from "../components/NotificationItem";

export default function Notification() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      title: "Alice",
      message: "đã theo dõi bạn.",
      time: "2 giờ trước",
      read: false,
      type: "follow",
    },
    {
      id: 2,
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      title: "Bob",
      message: "đã thích bài viết của bạn “Learning React Hooks”.",
      time: "5 giờ trước",
      read: false,
      type: "like",
    },
    {
      id: 3,
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      title: "Charlie",
      message: "đã bình luận: “Great post! Thanks for sharing.”",
      time: "Hôm qua",
      read: false,
      type: "response",
    },
    {
      id: 4,
      avatar: "https://randomuser.me/api/portraits/women/31.jpg",
      title: "Diana",
      message: "đã đăng một bài viết mới: “Designing Minimalist UI”.",
      time: "2 ngày trước",
      read: false,
      type: "post",
    },
  ]);

  const [filter, setFilter] = useState("all");

  // Khi bấm "Mark all as read"
  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  // Lọc theo tab
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === "response");

  return (
    <div className="w-full bg-white border rounded-lg shadow-sm">
      <div className="flex justify-between items-center px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-sm text-amber-500 hover:text-amber-600"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex border-b mt-4 text-sm font-medium">
        <button
          className={`px-6 py-3 border-b-2 ${
            filter === "all"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-400"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-6 py-3 border-b-2 ${
            filter === "response"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-400"
          }`}
          onClick={() => setFilter("response")}
        >
          Responses
        </button>
      </div>

      <div>
        {filteredNotifications.map((n, index) => (
          <NotificationItem
            key={n.id}
            avatar={n.avatar}
            title={n.title}
            message={n.message}
            time={n.time}
            isLast={index === filteredNotifications.length - 1}
            read={n.read}
          />
        ))}
      </div>
    </div>
  );
}
