// TLoi
import { useState } from "react";
import StatStories from "../components/StatStories";
import StatAudience from "../components/StatAudience";

export default function Stat() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <div>
      {/* Main */}
      <div className="md:pt-16 transition-all duration-300 relative z-10 pb-10">
        <div className="md:px-8 w-full max-w-none mt-15 mb-6">
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

          {activeTab === "stories" ? <StatStories /> : <StatAudience />}
        </div>
      </div>
    </div>
  );
}
