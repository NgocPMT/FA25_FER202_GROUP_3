import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function InfoTooltipStat({ text }) {
  return (
    <div className="flex items-center gap-1 text-gray-500 text-sm">
      <IoMdInformationCircleOutline className="text-lg" />
      <span>{text}</span>
    </div>
  );
}
