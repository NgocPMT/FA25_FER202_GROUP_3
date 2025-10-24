// HomeDashboard.js
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SideNavbar from "../components/SideNavbar";
import Notification from "./Notification";
import Articles from "../components/Articles";
import "../css/HomeDashboard.css";

const HomeDashboard = () => {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSideNav(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="home-grid min-h-lvh relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 z-60">
        <Navbar
          onToggleSideNav={() => setShowSideNav((v) => !v)}
          onBellClick={() => setShowNotification((v) => !v)}
          bellActive={showNotification}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ease-in-out lg:hidden ${showSideNav ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          onClick={() => setShowSideNav(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed top-14 left-0 h-[calc(100%-56px)] w-60 border-r border-gray-200 bg-white p-4 overflow-y-auto z-50
        transform transition-all duration-300 ease-in-out ${showSideNav
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <SideNavbar />
      </div>

      {/* Main + Right rail trong cùng container */}
      <div
        className={`pt-16 transition-all duration-300 relative z-10
    ${
          // có/không SideNavbar bên trái
          !isMobile && showSideNav ? "ml-60" : "ml-[150px]" // ← dịch trái nhẹ khi ẩn SideNavbar
          }`}
      >
        <div className="flex">
          {/* MAIN */}
          <main className="flex-1 p-6">
            {showNotification ? (
              <Notification />
            ) : (
              <div className="space-y-4">
                <Articles />
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR (sticky, đi theo layout) */}
          {!isMobile && (
            <aside
              className={`w-96 shrink-0 p-4 border-l border-gray-200
          sticky top-14 transition-all duration-300
          ${showSideNav ? "mr-0" : "mr-[120px]" /* đẩy trái nhẹ khi ẩn SideNavbar */}
        `}
            >
              <Sidebar />
            </aside>
          )}
        </div>
      </div>

    </div>
  );
};

export default HomeDashboard;
