import React, { useState, useEffect, useRef } from "react";
import DropdownSelectStat from "./DropdownSelectStat";
import SummaryStatsStat from "./SummaryStatsStat";
import StoryChartStat from "./StoryChartStat";
import StoryListStat from "./StoryListStat";

// keep your original data constant exactly
const data = [
  { date: "Oct 1", views: 20, reads: 15 },
  { date: "Oct 2", views: 22, reads: 17 },
  { date: "Oct 3", views: 25, reads: 18 },
  { date: "Oct 4", views: 28, reads: 20 },
  { date: "Oct 5", views: 30, reads: 18 },
  { date: "Oct 6", views: 35, reads: 22 },
  { date: "Oct 7", views: 40, reads: 25 },
  { date: "Oct 8", views: 38, reads: 27 },
  { date: "Oct 9", views: 42, reads: 30 },
  { date: "Oct 10", views: 25, reads: 12 },
  { date: "Oct 11", views: 45, reads: 33 },
  { date: "Oct 12", views: 50, reads: 35 },
  { date: "Oct 13", views: 48, reads: 34 },
  { date: "Oct 14", views: 52, reads: 38 },
  { date: "Oct 15", views: 40, reads: 25 },
  { date: "Oct 16", views: 55, reads: 42 },
  { date: "Oct 17", views: 35, reads: 28 },
  { date: "Oct 18", views: 58, reads: 44 },
  { date: "Oct 19", views: 60, reads: 46 },
  { date: "Oct 20", views: 62, reads: 48 },
  { date: "Oct 21", views: 65, reads: 50 },
  { date: "Oct 22", views: 70, reads: 52 },
  { date: "Oct 23", views: 68, reads: 49 },
  { date: "Oct 24", views: 72, reads: 55 },
  { date: "Oct 25", views: 75, reads: 58 },
  { date: "Oct 26", views: 78, reads: 60 },
  { date: "Oct 27", views: 80, reads: 62 },
  { date: "Oct 28", views: 83, reads: 64 },
  { date: "Oct 29", views: 85, reads: 66 },
  { date: "Oct 30", views: 88, reads: 68 },
  { date: "Oct 31", views: 90, reads: 70 },
];

export default function StatStories() {
  const [selectedPeriod, setSelectedPeriod] = useState("October 2025");
  const [openMonth, setOpenMonth] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [openSort, setOpenSort] = useState(false);
  const [stories, setStories] = useState([]);
  const [viewType, setViewType] = useState("Month");
  const [openViewType, setOpenViewType] = useState(false);

  const monthRef = useRef(null);
  const sortRef = useRef(null);
  const viewTypeRef = useRef(null);
  const [monthWidth, setMonthWidth] = useState(0);
  const [sortWidth, setSortWidth] = useState(0);
  const [viewTypeWidth, setViewTypeWidth] = useState(0);

  const months = ["October 2025", "September 2025", "August 2025"];
  const quarters = ["Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025"];
  const years = ["2025", "2024", "2023"];
  const sortOptions = [
    "Latest",
    "Oldest",
    "Most viewed",
    "Least viewed",
    "Most read",
    "Least read",
  ];

  useEffect(() => {
    setStories([
      {
        id: 1,
        title: "i love you",
        readTime: "1 min read",
        date: "Oct 18, 2025",
        views: 0,
        reads: 0,
      },
    ]);
    // setStories([]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target))
        setOpenMonth(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setOpenSort(false);
      if (viewTypeRef.current && !viewTypeRef.current.contains(e.target))
        setOpenViewType(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleTabChange = () => {
      setOpenMonth(false);
      setOpenSort(false);
      setOpenViewType(false);
    };

    window.addEventListener("blur", handleTabChange);
    window.addEventListener("focus", handleTabChange);
    document.addEventListener("visibilitychange", handleTabChange);

    return () => {
      window.removeEventListener("blur", handleTabChange);
      window.removeEventListener("focus", handleTabChange);
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, []);

  useEffect(() => {
    const updateWidths = () => {
      if (monthRef.current) setMonthWidth(monthRef.current.offsetWidth);
      if (sortRef.current) setSortWidth(sortRef.current.offsetWidth);
      if (viewTypeRef.current)
        setViewTypeWidth(viewTypeRef.current.offsetWidth);
    };

    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, [viewType, selectedPeriod]);

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="flex items-center justify-between w-full mt-10 mb-6 
        max-md:flex-col max-md:items-start max-md:gap-3"
      >
        <div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">Monthly</h3>
          <p className="text-sm text-gray-500 mb-10">
            October 1, 2025 – Today (UTC) · Updated hourly
          </p>
        </div>

        {/* Dropdown */}
        <DropdownSelectStat
          viewType={viewType}
          setViewType={setViewType}
          openViewType={openViewType}
          setOpenViewType={setOpenViewType}
          viewTypeRef={viewTypeRef}
          viewTypeWidth={viewTypeWidth}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          openMonth={openMonth}
          setOpenMonth={setOpenMonth}
          monthRef={monthRef}
          monthWidth={monthWidth}
          months={months}
          quarters={quarters}
          years={years}
        />
      </div>

      {/* Summary stats */}
      <SummaryStatsStat />

      {/* Chart */}
      <StoryChartStat data={data} />

      <hr className="my-10 border-gray-200" />

      {/* Lifetime header row and list */}
      <div
        className="flex items-center justify-between w-full mt-10 mb-6 
        max-md:flex-col max-md:items-start max-md:gap-3"
      >
        {/* Left: Lifetime info */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lifetime</h2>
          <p className="text-sm text-gray-600">
            October 18, 2025 – Today (UTC) <span className="mx-1 ">·</span>
            Updated daily
          </p>
        </div>

        {/* Right: Sort dropdown */}
        <div
          ref={sortRef}
          className="relative text-left max-md:block max-md:w-full"
        >
          <button
            onClick={() => {
              if (stories.length > 0) setOpenSort(!openSort);
            }}
            disabled={stories.length === 0}
            className={`inline-flex items-center justify-between w-44 rounded-full border px-3 py-2 text-sm font-semibold transition
                max-md:w-full cursor-pointer
            ${
              stories.length === 0
                ? "bg-white border-gray-200 text-gray-400 cursor-default"
                : "bg-white border-gray-200 text-gray-700  focus:ring-1 focus:ring-gray-400"
            }`}
          >
            {selectedSort}
            <svg
              className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
                openSort ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown with article */}
          {openSort && stories.length > 0 && (
            <div
              className="absolute right-0 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/10 z-10"
              style={{ width: `${sortWidth}px` }}
            >
              <ul className="py-1 text-sm text-gray-700">
                {sortOptions.map((option, index) => {
                  const showBorder = index === 1 || index === 3;

                  return (
                    <li key={option}>
                      <button
                        onClick={() => {
                          setSelectedSort(option);
                          setOpenSort(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition ${
                          selectedSort === option
                            ? "bg-white text-gray-900 font-medium hover:bg-gray-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{option}</span>
                        {selectedSort === option && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 text-black"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </button>

                      {showBorder && (
                        <div className="border-b border-gray-200 my-2 mx-3" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Story list component */}
      <StoryListStat
        stories={stories}
        sortRef={sortRef}
        openSort={openSort}
        setOpenSort={setOpenSort}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        sortOptions={sortOptions}
        sortWidth={sortWidth}
      />
    </div>
  );
}
