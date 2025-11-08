import React from "react";
import { Link } from "react-router-dom";
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
  lifetimeStart,
}) {
  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        {/* Lifetime */}
        <div>
          <h3 className="text-2xl font-medium text-gray-900 mb-1 max-md:text-xl">
            Lifetime
          </h3>
          <p className="text-sm text-gray-500 max-md:text-xs">
            {lifetimeStart
              ? lifetimeStart.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Unknown"}{" "}
            (UTC) · Since first post
          </p>
        </div>

        {/* Dropdown */}
        <div
          ref={sortRef}
          className="relative text-left max-md:w-full max-md:mt-2"
        >
          <button
            onClick={() => {
              if (stories.length > 0) setOpenSort(!openSort);
            }}
            disabled={stories.length === 0}
            className={`inline-flex items-center justify-between w-44 rounded-full px-4 py-2 text-sm font-semibold
              bg-white text-gray-700 shadow-sm
              ring-1 ring-gray-300 hover:bg-gray-50 transition
              max-md:w-full
              ${
                stories.length === 0
                  ? "opacity-50 cursor-default"
                  : "cursor-pointer"
              }
            `}
          >
            {selectedSort}
            <svg
              className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
                openSort ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openSort && stories.length > 0 && (
            <div
              className="absolute right-0 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/10 z-10"
              style={{ width: `${sortWidth}px` }}
            >
              <ul className="py-1 text-sm text-gray-700">
                {sortOptions.map((option, index) => {
                  const showBorder = index === 1 || index === 3;
                  return (
                    <li key={option}>
                      <button
                        onClick={() => {
                          setSelectedSort(option);
                          setOpenSort(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition ${
                          selectedSort === option
                            ? "bg-white text-gray-900 font-medium hover:bg-gray-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{option}</span>

                        {selectedSort === option && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 text-black"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </button>

                      {showBorder && (
                        <div className="border-b border-gray-200 my-2 mx-3" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

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

      {stories.length > 0 ? (
        <div className="border-t border-gray-200 py-4 pb-10 max-md:border-none max-md:pt-0">
          {stories.map((story) => (
            <StoryRowStat key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="border-t border-gray-200 py-1 flex justify-center gap-8 items-center text-sm font-medium">
          <p>You haven’t published any stories yet.</p>
          <Link to="/write">
            <button className="px-3 py-1 rounded-full bg-black text-white text-sm font-normal cursor-pointer">
              Start writing
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
