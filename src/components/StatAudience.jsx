import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import axios from "axios";

export default function StatAudience() {
  const [followers, setFollowers] = useState(0);
  const [changeFromLastMonth, setChangeFromLastMonth] = useState(0);
  const [today, setToday] = useState(new Date());

  // Auto update day
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) setToday(now);
    }, 60000);
    return () => clearInterval(t);
  }, [today]);

  // Fetch followers
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/me/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (Array.isArray(res.data)) setFollowers(res.data.length);
        else setFollowers(res.data.totalFollowers || 0);

        // Backend chưa hỗ trợ
        setChangeFromLastMonth(0);
      } catch {
        setFollowers(0);
        setChangeFromLastMonth(0);
      }
    })();
  }, []);

  return (
    <div className="w-full">
      <div className="mt-10 mb-6">
        <h3 className="text-2xl font-medium">Lifetime</h3>
        <p className="text-sm text-gray-500">
          {today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          (UTC) · Updated daily
        </p>
      </div>

      <div className="mb-8">
        <p className="text-5xl font-semibold">{followers}</p>

        <div className="flex items-center gap-1 text-sm font-semibold">
          <span>Followers</span>
          <div className="relative group">
            <IoMdInformationCircleOutline className="text-gray-600 cursor-pointer" />
            <div className="absolute hidden group-hover:block bg-white border shadow-lg p-4 rounded-lg w-56 mt-2 z-50">
              Readers who follow you on Medium.
            </div>
          </div>
        </div>

        <p className="text-sm mt-1">
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
              : changeFromLastMonth}
          </span>{" "}
          from last month
        </p>
      </div>
    </div>
  );
}
