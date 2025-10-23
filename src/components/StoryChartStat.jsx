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
  data,
  title = "Statistics of article views and reads",
}) {
  return (
    <div className="relative w-full h-[400px] overflow-visible">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend align="right" wrapperStyle={{ paddingBottom: 10 }} />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#7fbbcbff"
            strokeWidth={2}
            name="Views"
          />
          <Line
            type="monotone"
            dataKey="reads"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Reads"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
