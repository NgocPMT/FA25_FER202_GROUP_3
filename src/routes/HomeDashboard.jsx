// HomeDashboard.js
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Articles from "../components/Articles";
import { useOutletContext } from "react-router";

const HomeDashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1270);
  const { isCommentOpen } = useOutletContext();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1270;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex">
      <main className="flex-1">
        <div className="space-y-4">
          <Articles />
        </div>
      </main>
      {!isMobile && (
        <aside
          className={`w-96 shrink-0 p-4 border-l border-gray-200
            ${isCommentOpen ? "static z-0" : "sticky top-14 z-20"}
          `}
        >
          <Sidebar />
        </aside>
      )}
    </div>
  );
};

export default HomeDashboard;
