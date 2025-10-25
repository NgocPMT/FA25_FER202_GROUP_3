import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/SideNavbar";
import { useState, useEffect } from "react";
import "../css/Layout.css";

const Layout = () => {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
    <div className="layout-grid min-h-lvh relative">
      <div className="fixed top-0 left-0 right-0 h-14 z-60">
        <Navbar onToggleSideNav={() => setShowSideNav((v) => !v)} />
      </div>

      {isMobile && (
        <button
          className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ease-in-out lg:hidden ${
            showSideNav ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setShowSideNav(false)}
        ></button>
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

      <main
        className={`pt-16 transition-all duration-300 relative z-10
    ${!isMobile && showSideNav ? "ml-60" : "mx-4 md:mx-24"}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
