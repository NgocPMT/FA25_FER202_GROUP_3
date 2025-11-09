import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StoryChartStat({
  data = [],
  title = "Statistics of article views and reactions",
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  let sortedData = [];
  if (hasData) {
    const grouped = data.reduce((acc, cur) => {
      const day = new Date(cur.date);
      day.setHours(0, 0, 0, 0);
      const key = day.getTime();

      if (!acc[key]) acc[key] = { date: key, views: 0, reactions: 0 };
      acc[key].views += cur.views || 0;
      acc[key].reactions += cur.reactions || 0;
      return acc;
    }, {});

    sortedData = Object.values(grouped).sort((a, b) => a.date - b.date);
  }

  return (
    <div className="relative w-full h-[400px] overflow-visible">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
        {title}
      </h3>

      {!hasData ? (
        <div className="flex items-center justify-center w-full h-[400px] text-gray-400 text-sm italic border border-dashed border-gray-300 rounded-xl">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={sortedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "views") return [value, "Views"];
                if (name === "reactions") return [value, "Reactions"];
                return [value, name];
              }}
              labelFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
            <Legend align="right" verticalAlign="bottom" />
            //views
            <Line
              type="monotone"
              dataKey="views"
              stroke="#7fbbcbff"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Views"
            />
            //reactions
            <Line
              type="monotone"
              dataKey="reactions"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Reactions"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
