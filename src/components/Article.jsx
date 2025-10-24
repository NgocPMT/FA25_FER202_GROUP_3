// nhan
import React from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots } from "react-icons/bs";

export default function Article({ data }) {
  const { author, title, description, date, stats, image } = data;

  return (
    <div className="flex justify-between items-start border-b border-gray-200 pb-6">
      {/* Left */}
      <div className="flex-1 pr-4">
        <p className="text-sm text-gray-600 mb-1">{author}</p>
        <h2 className="text-xl font-semibold mb-1 hover:underline cursor-pointer">
          {title}
        </h2>
        <p className="text-gray-600 mb-3">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{date}</span>
          <span className="flex items-center gap-1">
            <BsStarFill className="text-yellow-500" /> {stats.likes}
          </span>
          <span className="flex items-center gap-1">
            <BsChat /> {stats.comments}
          </span>
          <BsBookmark className="ml-auto cursor-pointer hover:text-black" />
          <BsThreeDots className="cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Right */}
      <img
        src={image}
        alt={title}
        className="w-36 h-24 object-cover rounded-md"
      />
    </div>
  );
}
