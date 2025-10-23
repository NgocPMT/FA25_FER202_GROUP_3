import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function StatAudience() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mt-10 mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3 max-md:text-xl">
            Lifetime
          </h3>
          <p className="text-sm text-gray-500 max-md:text-xs">
            October 17, 2025 – Today (UTC) · Updated daily
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="flex flex-wrap justify-start gap-32 max-md:gap-10 mb-8">
        {/* Followers */}
        <div className="relative text-left">
          <p className="text-5xl max-md:text-3xl font-semibold text-gray-900 mb-2 text-left">
            0
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
          <p className="text-sm font-medium text-gray-900 mt-1 max-md:text-xs">
            0 from last month
          </p>
        </div>

        {/* Email Subscribers */}
        <div className="relative text-left">
          <p className="text-5xl max-md:text-3xl font-semibold text-gray-900 mb-2 text-left">
            0
          </p>
          <div className="flex items-center justify-center gap-1 text-sm max-md:text-xs text-gray-900 font-semibold">
            <p>Email Subscribers</p>

            <div className="relative group">
              <IoMdInformationCircleOutline className="text-gray-700 text-lg cursor-pointer transition" />

              <div
                className="absolute top-full left-1/2 -translate-x-1/2 ml-5 mt-2 hidden group-hover:block 
                bg-white text-gray-900 border border-gray-100 text-sm rounded-lg 
                px-5 py-4 w-66 max-md:w-56 max-md:ml-0 max-md:text-xs shadow-xl z-50 text-left"
              >
                Readers who have opted to receive emails from you. This excludes
                unsubscribed, inactive, deactivated, deleted, or suspended
                users.
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1 max-md:text-xs">
            0 from last month
          </p>
        </div>
      </div>
    </div>
  );
}
