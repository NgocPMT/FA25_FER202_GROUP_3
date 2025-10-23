import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import StoryRowStat from "./StoryRowStat";

export default function StoryListStat({
  stories,
  sortRef,
  openSort,
  setOpenSort,
  selectedSort,
  setSelectedSort,
  sortOptions,
  sortWidth,
}) {
  return (
    <div className="mt-20">
      {/* Header */}
      <div
        className="grid grid-cols-[100px_1fr_300px] lg:grid-cols-[1fr_300px] items-center text-sm text-gray-500 py-2 mb-3 
      font-medium max-md:hidden"
      >
        <div className="hidden md:block lg:hidden text-left">Published</div>
        <div className="text-left max-md:hidden">Story</div>

        <div className="grid grid-cols-3 gap-x-12 max-md:gap-0 text-center">
          <div className="flex items-center justify-center gap-1 relative">
            <span>Presentations</span>
            <div className="relative group">
              <IoMdInformationCircleOutline className="text-gray-400 text-lg cursor-pointer" />
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-left text-gray-900 
              border border-gray-100 text-sm rounded-lg px-5 py-5 w-64 shadow-lg z-50 max-md:text-xs"
              >
                Times this story was presented across Medium, or via push/email
                notifications (excluding the Daily Digest). Not available for
                stories published before 2025.
              </div>
            </div>
          </div>
          <span>Views</span>
          <span>Reads</span>
        </div>
      </div>

      {/* Body */}
      {stories.length > 0 ? (
        <div className="border-t border-gray-200 py-4 pb-10 max-md:border-none max-md:pt-0">
          {stories.map((story) => (
            <StoryRowStat key={story.id} story={story} />
          ))}
        </div>
      ) : (
        // Without article
        <div className="border-t border-gray-200 py-1 flex justify-center gap-8 items-center text-sm font-medium">
          <p>You haven’t published any stories yet.</p>
          <button className="px-3 py-1 rounded-full bg-black text-white text-sm font-normal cursor-pointer">
            Start writing
          </button>
        </div>
      )}
    </div>
  );
}
