import { useState, useEffect } from "react";
import NotificationItem from "../components/NotificationItem";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
        console.log(data);
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

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/me/notifications/read`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
      }
    );
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error);
      return;
    }
    const data = await res.json();
    toast.success(data.message);
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent("notifications-read"));
  };

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

        <div className="overflow-y-auto flex-1">
          {notifications.length > 0 ? (
            notifications.map((n, index) => (
  <NotificationItem
    key={n.id}
    avatar={n.actor?.Profile?.avatarUrl}
    message={n.message}
    time={n.createdAt}
    isLast={index === notifications.length - 1}
    read={n.isRead}
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
