import React from "react";
import { Link } from "react-router";

export default function StoryRowStat({ story }) {
  return (
    <div
      key={story.id}
      className="grid grid-cols-[100px_1fr_200px] lg:grid-cols-[1fr_200px] items-center py-3
        max-md:flex max-md:flex-col max-md:items-start max-md:gap-2 max-md:pb-4"
    >
      {/* Published Date (hidden on mobile) */}
      <div className="text-left text-sm text-gray-600 lg:hidden max-md:hidden">
        {story.date}
      </div>

      {/* Story Info */}
      <div className="text-left">
        <Link
          to={`/posts/${story.slug}`}
          className="story-title font-semibold text-gray-900 cursor-pointer"
        >
          {story.title}
        </Link>
        <p className="text-sm text-gray-500">
          {story.readTime} · {story.date} ·{" "}
          <Link
            to={`/posts/${story.slug}`}
            className="underline hover:text-gray-800 cursor-pointer"
          >
            View story
          </Link>
        </p>
      </div>

      {/* desktop grid */}
      <div className="grid grid-cols-2 gap-x-12 text-center text-sm font-medium text-gray-900 max-md:hidden">
        <span>{story.views}</span>
        <span>{story.reactions}</span>
      </div>

      {/* mobile grid */}
      <div className="grid grid-cols-2 gap-x-10 text-center text-sm font-medium text-gray-900 lg:hidden md:hidden">
        <div>
          <div>{story.views}</div>
          <div className="text-gray-500 text-xs mt-1">Views</div>
        </div>
        <div>
          <div>{story.reactions}</div>
          <div className="text-gray-500 text-xs mt-1">Reactions</div>
        </div>
      </div>
    </div>
  );
}
