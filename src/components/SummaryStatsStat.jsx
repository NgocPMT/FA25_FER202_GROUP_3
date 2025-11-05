import React from "react";

export default function SummaryStatsStat({ data = {} }) {
  const stats = [
    { label: "Views", value: data.views || 0 },
    { label: "Reactions", value: data.reactions || 0 },
    { label: "Followers", value: data.followers || 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-14 mb-8 text-left">
      {stats.map(({ label, value }) => (
        <div key={label} className="relative">
          <p className="text-5xl max-md:text-3xl font-semibold text-gray-900 text-center mb-2">
            {value}
          </p>
          <p className="text-sm max-md:text-xs text-gray-900 font-semibold text-center">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
