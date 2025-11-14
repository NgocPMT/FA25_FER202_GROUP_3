import { useState, useEffect } from "react";
import NotificationItem from "../components/NotificationItem";
import Sidebar from "../components/Sidebar";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/notifications`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("❌ Error fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === "response");

  return (
    <div className="grid grid-cols-[1fr_auto]">
      <div
        className="w-full min-h-screen bg-white
                 flex flex-col overflow-hidden 
                 fixed lg:static top-[64px] left-0 right-0 z-40 
                 lg:w-full lg:max-w-[100%] transition-all duration-300"
      >
        <div className="flex justify-between items-center px-6 pt-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-sm text-amber-500 hover:text-amber-600 cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex border-b mt-4 text-sm font-medium">
          <button
            className={`px-6 py-3 border-b-2 cursor-pointer ${
              filter === "all"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-400"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-6 py-3 border-b-2 cursor-pointer ${
              filter === "response"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-400"
            }`}
            onClick={() => setFilter("response")}
          >
            Responses
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n, index) => (
              <NotificationItem
                key={n.id}
                avatar={n.avatarUrl}
                message={n.message}    
                time={n.time}
                isLast={index === filteredNotifications.length - 1}
                read={n.read}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">No notifications</p>
          )}
        </div>
      </div>

      {!isMobile && (
        <aside
          className={`w-96 shrink-0 p-4 border-l border-gray-200
                sticky top-14 transition-all duration-300
              `}
        >
          <Sidebar />
        </aside>
      )}
    </div>
  );
}
