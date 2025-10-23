import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function StoryRowStat({ story }) {
  return (
    <div
      key={story.id}
      className="grid grid-cols-[100px_1fr_300px] lg:grid-cols-[1fr_300px] items-center py-3
          max-md:flex max-md:flex-col max-md:items-start max-md:gap-2 max-md:pb-4"
    >
      <div className="text-left text-sm text-gray-600 lg:hidden max-md:hidden">
        {story.date}
      </div>

      <div className="text-left">
        <p className="font-semibold text-gray-900">{story.title}</p>
        <p className="text-sm text-gray-500">
          {story.readTime} · {story.date} ·{" "}
          <a href="#" className="underline hover:text-gray-800">
            View story
          </a>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-x-12 text-center text-sm font-medium text-gray-900 max-md:hidden">
        <span>0</span>
        <span>{story.views}</span>
        <span>{story.reads}</span>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-3 text-center text-sm font-medium text-gray-900 max-md:order-3 lg:hidden md:hidden">
        <div>
          <div>0</div>
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mt-1">
            <span>Presentations</span>
            <div className="relative group">
              <IoMdInformationCircleOutline className="text-gray-400 text-lg cursor-pointer" />
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-gray-900 
              border border-gray-100 text-sm text-left rounded-lg px-5 py-5 w-64 shadow-lg z-50 max-md:text-xs"
              >
                Times this story was presented across Medium, or via push/email
                notifications (excluding the Daily Digest). Not available for
                stories published before 2025.
              </div>
            </div>
          </div>
        </div>

        <div>
          <div>{story.views}</div>
          <div className="text-gray-500 text-xs mt-1">Views</div>
        </div>

        <div>
          <div>{story.reads}</div>
          <div className="text-gray-500 text-xs mt-1">Reads</div>
        </div>
      </div>
    </div>
  );
}
