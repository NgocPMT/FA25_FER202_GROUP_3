import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import DropdownSelectStat from "./DropdownSelectStat";
import SummaryStatsStat from "./SummaryStatsStat";
import StoryChartStat from "./StoryChartStat";
import StoryListStat from "./StoryListStat";

export default function StatStories() {
  const [chartData, setChartData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stories, setStories] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [selectedSort, setSelectedSort] = useState("Latest");
  const [openSort, setOpenSort] = useState(false);
  const sortRef = useRef(null);
  const [sortWidth, setSortWidth] = useState(0);

  const [today, setToday] = useState(new Date());
  const [isUserPaging, setIsUserPaging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const [lifetimeStart, setLifetimeStart] = useState(null);

  const listTopRef = useRef(null);

  const sortOptions = [
    "Latest",
    "Oldest",
    "Most viewed",
    "Least viewed",
    "Most reactions",
    "Least reactions",
  ];

  // Scroll to the top of the list when the user clicks Prev / Next
  useEffect(() => {
    if (!isUserPaging) return;

    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsUserPaging(false);
  }, [page]);

  // Update auto date
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) setToday(now);
    }, 60000);
    return () => clearInterval(timer);
  }, [today]);

  // Get total number of followers
  useEffect(() => {
    async function fetchFollowers() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (Array.isArray(res.data)) {
          setFollowersCount(res.data.length);
        } else if (res.data.totalFollowers !== undefined) {
          setFollowersCount(res.data.totalFollowers);
        }
      } catch {
        setFollowersCount(0);
      }
    }

    fetchFollowers();
  }, []);

  // Sort stories using useMemo
  const sortedStories = useMemo(() => {
    if (!stories.length) return [];

    const arr = [...stories];

    const sortMap = {
      Latest: () => arr.sort((a, b) => b.dateValue - a.dateValue),
      Oldest: () => arr.sort((a, b) => a.dateValue - b.dateValue),
      "Most viewed": () => arr.sort((a, b) => b.views - a.views),
      "Least viewed": () => arr.sort((a, b) => a.views - b.views),
      "Most reactions": () => arr.sort((a, b) => b.reactions - a.reactions),
      "Least reactions": () => arr.sort((a, b) => a.reactions - b.reactions),
    };

    sortMap[selectedSort]?.();
    return arr;
  }, [stories, selectedSort]);

  // Get data for chart
  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/statistics?page=1&limit=99999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const posts = res.data?.posts || [];

        const formatted = posts.map((p) => ({
          id: p._id || p.id,
          title: p.title || "Untitled",
          date: new Date(p.createdAt).getTime(),
          views: p.PostView?.length || 0,
          reactions: p.PostReaction?.length || 0,
        }));

        setChartData(formatted);
        setFilteredData(formatted);
      } catch {
        setChartData([]);
        setFilteredData([]);
      }
    }

    fetchStats();
  }, []);

  // Get all stories
  useEffect(() => {
    async function fetchStories() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/me/posts?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;

        const formatted = data.map((post) => {
          const d = new Date(post.createdAt);
          return {
            id: post._id || post.id,
            title: post.title || "Untitled",
            readTime: post.readTime || "1 min read",
            date: d.toISOString().split("T")[0],
            dateValue: d.getTime(),
            views: post.PostView?.length || 0,
            reactions: post.PostReaction?.length || 0,
          };
        });

        setStories(formatted);
        setHasNext(data.length === limit);

        if (formatted.length > 0) {
          const earliest = Math.min(...formatted.map((s) => s.dateValue));
          setLifetimeStart(new Date(earliest));
        }
      } catch (err) {
        console.error("❌ Fetch stories failed:", err);
        setStories([]);
        setHasNext(false);
      }
      setLoading(false);
    }

    fetchStories();
  }, [page]);

  // Close dropdown when clicking out
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Get dropdown width to render
  useEffect(() => {
    if (sortRef.current) setSortWidth(sortRef.current.offsetWidth);
  }, []);

  // Total views / reactions
  const summaryData = {
    views: filteredData.reduce((s, i) => s + (i.views || 0), 0),
    reactions: filteredData.reduce((s, i) => s + (i.reactions || 0), 0),
    followers: followersCount,
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mt-10 mb-6 max-md:flex-col max-md:items-start">
        <div>
          <h3 className="text-2xl font-medium mb-3">Choosed Time</h3>
          <p className="text-sm text-gray-500">
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            (UTC) · Updated daily
          </p>
        </div>
        {/* From–To date filter */}
        <DropdownSelectStat
          chartData={chartData}
          setFilteredData={setFilteredData}
        />
      </div>
      {/* Summary (Views / Reactions / Followers) */}
      <SummaryStatsStat data={summaryData} />
      {/* Chart */}
      <StoryChartStat data={filteredData} />

      <hr className="mt-20 border-gray-200" />
      {/* Story list */}
      <div ref={listTopRef}>
        <StoryListStat
          stories={stories}
          sortRef={sortRef}
          openSort={openSort}
          setOpenSort={setOpenSort}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          sortOptions={sortOptions}
          sortWidth={sortWidth}
          today={today}
          lifetimeStart={lifetimeStart}
        />
      </div>

      {/* Pagination */}
      {stories.length > 0 && (
        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1 rounded-full bg-white transition ${
              page === 1
                ? "invisible"
                : "cursor-pointer opacity-40 hover:opacity-60"
            }`}
          >
            Prev
          </button>

          <span className="px-3 py-1 opacity-70">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded-full bg-white transition ${
              !hasNext
                ? "invisible"
                : "cursor-pointer opacity-40 hover:opacity-60"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
