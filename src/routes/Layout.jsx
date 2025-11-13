import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/SideNavbar";
import { useState, useEffect } from "react";
import "../css/Layout.css";

const Layout = () => {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth >= 1270);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1270);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1270;
      setIsMobile(mobile);
      setShowSideNav(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout-grid min-h-lvh relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 z-60">
        <Navbar onToggleSideNav={() => setShowSideNav((v) => !v)} />
      </div>

      {/* sidebar moblie */}
      {isMobile && (
        <button
          className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ease-in-out cursor-pointer ${
            showSideNav ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setShowSideNav(false)}
        ></button>
      )}

      {/* Sidebar left*/}
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

      {/* main */}
      <main
        className={`pt-16 relative ${isCommentOpen ? "z-100" : "z-10"} ${
          !isMobile && showSideNav ? "ml-60" : "mx-4"
        }`}
      >
        <Outlet context={{ setIsCommentOpen, isCommentOpen }} />
      </main>
    </div>
  );
};

export default Layout;
