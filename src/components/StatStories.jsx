import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DropdownSelectStat from "./DropdownSelectStat";
import SummaryStatsStat from "./SummaryStatsStat";
import StoryChartStat from "./StoryChartStat";
import StoryListStat from "./StoryListStat";

export default function StatStories() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stories, setStories] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);

  const filterDataByDate = (startYMD, endYMD) => {
    if (!chartData || chartData.length === 0) {
      setFilteredData([]);
      return;
    }

    const parseYMD = (ymd) => {
      const [y, m, d] = ymd.split("-").map((v) => parseInt(v, 10));
      return new Date(y, m - 1, d);
    };

    const start = parseYMD(startYMD);
    const end = parseYMD(endYMD);

    const filtered = chartData.filter((item) => {
      const itemDate = parseYMD(item.date);
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  };

  // Sort dropdown
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef(null);
  const [sortWidth, setSortWidth] = useState(0);
  const [today, setToday] = useState(new Date());

  const sortOptions = [
    "Latest",
    "Oldest",
    "Most viewed",
    "Least viewed",
    "Most read",
    "Least read",
  ];

  // total views/reactions/followers
  const totalViews = filteredData.reduce(
    (sum, item) => sum + (item.views || 0),
    0
  );
  const totalReactions = filteredData.reduce(
    (sum, item) => sum + (item.reactions || 0),
    0
  );
  const summaryData = {
    views: totalViews,
    reactions: totalReactions,
    followers: followersCount,
  };

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/followers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(res.data)) {
          setFollowersCount(res.data.length);
        } else if (res.data.totalFollowers !== undefined) {
          setFollowersCount(res.data.totalFollowers);
        } else {
          setFollowersCount(0);
        }
      } catch (err) {
        console.error("Error fetching followers:", err);
        setFollowersCount(0);
      }
    };

    fetchFollowers();
  }, []);

  // Sort stories
  useEffect(() => {
    if (stories.length === 0) return;
    const sorted = [...stories];

    switch (selectedSort) {
      case "Latest":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "Oldest":
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "Most viewed":
        sorted.sort((a, b) => b.views - a.views);
        break;
      case "Least viewed":
        sorted.sort((a, b) => a.views - b.views);
        break;
      case "Most read":
        sorted.sort((a, b) => b.reads - a.reads);
        break;
      case "Least read":
        sorted.sort((a, b) => a.reads - b.reads);
        break;
      default:
        break;
    }

    setStories(sorted);
  }, [selectedSort]);

  // auto update day
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) setToday(now);
    }, 60000);
    return () => clearInterval(timer);
  }, [today]);

  // Fetch chart
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/statistics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const posts = res.data?.posts || [];

        const aggregatedData = posts.reduce((acc, p) => {
          const date = new Date(p.createdAt).toISOString().split("T")[0];
          const existing = acc.find((d) => d.date === date);
          const views = p.PostView ? p.PostView.length : 0;
          const reactions = p.PostReaction ? p.PostReaction.length : 0;

          if (existing) {
            existing.views += views;
            existing.reactions += reactions;
          } else {
            acc.push({
              date: new Date(date).getTime(),
              views,
              reactions,
            });
          }
          return acc;
        }, []);

        setChartData(aggregatedData);
        setFilteredData(aggregatedData);

        if (aggregatedData.length > 0) {
          const dates = aggregatedData.map((d) => new Date(d.date));
          const min = new Date(Math.min(...dates));
          const max = new Date(Math.max(...dates));
          const toYMD = (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(date.getDate()).padStart(2, "0")}`;
          setFromDate(toYMD(min));
          setToDate(toYMD(max));
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };
    fetchStatistics();
  }, []);

  //  Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const formatted =
          res.data?.map((post) => ({
            id: post._id || post.id,
            title: post.title || "Untitled",
            readTime: post.readTime || "1 min read",
            date: new Date(post.createdAt).toISOString().split("T")[0],
            views: post.PostView ? post.PostView.length : 0,
            reactions: post.PostReaction ? post.PostReaction.length : 0,
          })) || [];

        setStories(formatted);
      } catch {
        setStories([]);
      }
    };
    fetchStories();
  }, []);

  // Dropdown blur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setOpenSort(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (sortRef.current) setSortWidth(sortRef.current.offsetWidth);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="flex items-center justify-between w-full mt-10 mb-6 
        max-md:flex-col max-md:items-start max-md:gap-3"
      >
        <div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3 max-md:text-xl">
            Monthly
          </h3>
          <p className="text-sm text-gray-500 max-md:text-xs">
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            (UTC) · Updated daily
          </p>
        </div>

        {/* Dropdown */}
        <DropdownSelectStat
          chartData={chartData}
          setFilteredData={setFilteredData}
        />
      </div>

      {/* Summary */}
      <SummaryStatsStat data={summaryData} />

      {/* Chart */}
      <StoryChartStat data={filteredData} />

      <hr className="my-10 border-gray-200" />

      {/* Lifetime section */}
      <div
        className="flex items-center justify-between w-full mt-10 mb-6 
        max-md:flex-col max-md:items-start max-md:gap-3"
      >
        <div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3 max-md:text-xl">
            Lifetime
          </h3>
          <p className="text-sm text-gray-500 max-md:text-xs">
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            (UTC) · Updated daily
          </p>
        </div>

        {/* Sort dropdown */}
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

      {/* Story list */}
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
