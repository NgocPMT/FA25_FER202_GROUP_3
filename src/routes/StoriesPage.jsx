import Stories from "../components/Stories";
import Sidebar from "../components/SideNavbar";
import StatusFilter from "../components/StatusFilter";
import { useState, useEffect, useRef } from "react";

export default function StoriesPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowStatusFilter(false);
      }
    }
    if (showStatusFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStatusFilter]);

  return (
    <div className="flex">
      <main className="flex-1 p-6 relative">
        <Stories
          filter={selectedStatuses}
          onToggleStatusFilter={() => setShowStatusFilter(!showStatusFilter)}
        />

        {showStatusFilter && (
          <div
            ref={filterRef}
            className="absolute right-[4.5rem] top-[11.5rem] z-50"
          >
            <StatusFilter
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              onClose={() => setShowStatusFilter(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
