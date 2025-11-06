import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import axios from "axios";

export default function StatAudience() {
  const [followers, setFollowers] = useState(0);
  const [changeFromLastMonth, setChangeFromLastMonth] = useState(0);
  const [today, setToday] = useState(new Date());

  // update day
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) {
        setToday(now);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [today]);

  useEffect(() => {
    const fetchAudienceStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const [followersRes, statsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/me/followers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/me/statistics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Total followers
        if (Array.isArray(followersRes.data)) {
          setFollowers(followersRes.data.length);
        } else if (followersRes.data.totalFollowers !== undefined) {
          setFollowers(followersRes.data.totalFollowers);
        }

        // Followers increase/decrease during the month
        if (statsRes.data?.followersChangeMonth !== undefined) {
          setChangeFromLastMonth(statsRes.data.followersChangeMonth);
        } else {
          setChangeFromLastMonth(0);
        }
      } catch (err) {
        console.error("Error fetching audience stats:", err);
        setFollowers(0);
        setChangeFromLastMonth(0);
      }
    };

    fetchAudienceStats();
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mt-10 mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
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
      </div>

      {/* Followers Overview */}
      <div className="flex flex-wrap justify-start gap-32 max-md:gap-10 mb-8">
        <div className="relative text-left">
          <p className="text-5xl max-md:text-3xl font-semibold text-gray-900 mb-2 text-left">
            {followers}
          </p>
          <div className="flex items-center justify-start gap-1 text-sm max-md:text-xs text-gray-900 font-semibold text-left">
            <p className="text-left">Followers</p>
            <div className="relative group">
              <IoMdInformationCircleOutline className="text-gray-700 text-lg cursor-pointer transition" />
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 ml-5 mt-2 hidden group-hover:block 
                bg-white text-gray-900 border border-gray-100 text-sm rounded-lg 
                px-5 py-4 w-56 max-md:w-46 max-md:ml-10 max-md:text-xs shadow-xl z-50 text-left"
              >
                Readers who follow you on Medium. This excludes deactivated,
                deleted, or suspended users.
              </div>
            </div>
          </div>
          <p className="text-sm font-medium mt-1 max-md:text-xs text-gray-900">
            <span
              className={`${
                changeFromLastMonth > 0
                  ? "text-green-600"
                  : changeFromLastMonth < 0
                  ? "text-red-500"
                  : "text-gray-900"
              }`}
            >
              {changeFromLastMonth >= 0
                ? `+${changeFromLastMonth}`
                : `${changeFromLastMonth}`}
            </span>{" "}
            from last month
          </p>
        </div>
      </div>
    </div>
  );
}
