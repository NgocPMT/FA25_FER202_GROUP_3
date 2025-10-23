// TLoi
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/SideNavbar";
import StatStories from "../components/StatStories";
import StatAudience from "../components/StatAudience";
import "../css/HomeDashboard.css";

export default function Stat() {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTab, setActiveTab] = useState("stories");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSideNav(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="home-grid min-h-lvh relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 z-60">
        <Navbar onToggleSideNav={() => setShowSideNav((v) => !v)} />
      </div>

      {/* Overlay for mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ease-in-out lg:hidden ${
            showSideNav ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setShowSideNav(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed top-14 left-0 h-[calc(100%-56px)] w-60 border-r border-gray-200 bg-white p-4 overflow-y-auto z-50
        transform transition-all duration-300 ease-in-out ${
          showSideNav
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <SideNavbar />
      </div>

      {/* Main */}
      <main
        className={`pt-16 transition-all duration-300 relative z-10 pb-10 ${
          !isMobile && showSideNav ? "ml-60" : "ml-0"
        }`}
      >
        <div className="px-8 w-full max-w-none mt-15 mb-6">
          <h1 className="text-5xl font-semibold mt-15 mb-10">Stats</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-10 gap-10">
            <button
              onClick={() => setActiveTab("stories")}
              className={`group py-4 font-medium ${
                activeTab === "stories"
                  ? "border-b border-gray-400 text-black"
                  : "text-gray-500"
              }`}
            >
              <span className="group-hover:cursor-pointer">Stories</span>
            </button>

            <button
              onClick={() => setActiveTab("audience")}
              className={`group py-4 font-medium ${
                activeTab === "audience"
                  ? "border-b-2 border-gray-400 text-black"
                  : "text-gray-500"
              }`}
            >
              <span className="group-hover:cursor-pointer">Audience</span>
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "stories" ? <StatStories /> : <StatAudience />}
        </div>
      </main>
    </div>
  );
}
