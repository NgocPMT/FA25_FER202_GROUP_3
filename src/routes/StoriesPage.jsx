import Stories from "../components/Stories";
import Sidebar from "../components/SideNavbar";
import StatusFilter from "../components/StatusFilter";
import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router";

export default function StoriesPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex">
      <main className="flex-1 p-6 relative">
        <Stories />
      </main>
    </div>
  );
}
