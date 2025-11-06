import React from "react";
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
        className="grid grid-cols-[100px_1fr_200px] lg:grid-cols-[1fr_200px] items-center text-sm text-gray-500 py-2 mb-3 
      font-medium max-md:hidden"
      >
        <div className="hidden md:block lg:hidden text-left">Published</div>
        <div className="text-left max-md:hidden">Story</div>

        <div className="grid grid-cols-2 gap-x-12 max-md:gap-0 text-center">
          <span>Views</span>
          <span>Reactions</span>
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
