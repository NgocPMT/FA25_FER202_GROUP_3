// HomeDashboard.js
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Articles from "../components/Articles";

const HomeDashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <div className="space-y-4">
          <Articles />
        </div>
      </main>

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
};

export default HomeDashboard;
