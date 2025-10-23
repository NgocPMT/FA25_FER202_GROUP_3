import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function SummaryStatsStat() {
  return (
    <div className="flex flex-wrap items-center gap-14 mb-8 text-left">
      {["Presentations", "Views", "Reads", "Followers", "Subscribers"].map(
        (label) => (
          <div key={label} className="relative">
            <p className="text-5xl max-md:text-3xl font-semibold text-gray-900 text-center mb-2">
              0
            </p>

            {label === "Presentations" ? (
              <div className="flex items-center justify-center gap-1 text-sm max-md:text-xs text-gray-900 font-semibold">
                <p className="font-semibold text-gray-900">{label}</p>

                <div className="relative group">
                  <IoMdInformationCircleOutline className="text-gray-700 text-lg cursor-pointer transition" />

                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block 
                          bg-white text-gray-900 border border-gray-100 text-sm rounded-lg 
                          px-5 py-5 w-64 shadow-lg z-50 max-md:text-xs"
                  >
                    Times this story was presented across Medium, or via
                    push/email notifications (excluding the Daily Digest). Not
                    available for stories published before 2025.
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm max-md:text-xs text-gray-900 font-semibold">
                {label}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
