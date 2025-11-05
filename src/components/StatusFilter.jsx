// src/components/StatusFilter.jsx
import { useState } from "react";

const statuses = [
    { label: "Pending review", color: "bg-gray-200" },
    { label: "In review", color: "bg-blue-100 text-blue-700" },
    { label: "Edits requested", color: "bg-yellow-100 text-yellow-700" },
    { label: "Approved", color: "bg-green-100 text-green-700" },
    { label: "Withdrawn", color: "bg-gray-100 text-gray-600" },
    { label: "Declined", color: "bg-red-100 text-red-600" },
];

export default function StatusFilter({ selected, onChange }) {
    const toggleStatus = (status) => {
        if (selected.includes(status)) {
            onChange(selected.filter((s) => s !== status));
        } else {
            onChange([...selected, status]);
        }
    };

    return (
        <div className="p-4 rounded-lg shadow bg-white border border-gray-200 w-64">
            <h3 className="font-semibold text-gray-600 text-sm mb-2">FILTER</h3>
            <div className="space-y-2">
                {statuses.map((s) => (
                    <label
                        key={s.label}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(s.label)}
                            onChange={() => toggleStatus(s.label)}
                        />
                        <span className={`px-2 py-1 rounded ${s.color}`}>{s.label}</span>
                    </label>
                ))}
            </div>

            <div className="flex justify-between mt-4 text-sm">
                <button onClick={() => onChange([])} className="text-blue-600">
                    Clear all
                </button>
                <button className="bg-black text-white px-3 py-1 rounded">
                    Apply
                </button>
            </div>
        </div>
    );
}
