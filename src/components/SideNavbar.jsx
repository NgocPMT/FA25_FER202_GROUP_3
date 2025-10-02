import { useState } from "react";
import {
  BsHouse,
  BsHouseFill,
  BsBookmark,
  BsBookmarkFill,
  BsPerson,
  BsPersonFill,
  BsFileText,
  BsFileTextFill,
  BsBarChart,
  BsBarChartFill,
  BsPeople,
  BsFillPeopleFill,
  BsPlusCircle,
} from "react-icons/bs";

import { FiPlus } from "react-icons/fi";

const MenuItem = ({ icon, iconFill, label, href, active, onClick }) => {
  return (
    <li
      onClick={onClick}
      className="relative group flex items-center gap-4 pl-4 pr-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 border border-gray-200"
    >
      <span
        className={`absolute top-0 -left-4 h-full w-0.5 rounded-r ${
          active ? "bg-gray-800" : "bg-transparent group-hover:bg-gray-800"
        }`}
      ></span>

      <span
        className={`group-hover:hidden ${active ? "hidden" : ""} text-gray-600`}
      >
        {icon}
      </span>

      <span
        className={`hidden group-hover:inline ${
          active ? "inline text-black" : ""
        }`}
      >
        {iconFill}
      </span>

      <a
        href={href}
        className={`flex-1 ${
          active ? "font-bold text-black" : "group-hover:font-bold"
        }`}
      >
        {label}
      </a>
    </li>
  );
};

const SideNavbar = () => {
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <div>
      <ul className="space-y-3">
        <MenuItem
          icon={<BsHouse />}
          iconFill={<BsHouseFill />}
          label="Home"
          href="#"
          active={activeItem === "Home"}
          onClick={() => setActiveItem("Home")}
        />
        <MenuItem
          icon={<BsBookmark />}
          iconFill={<BsBookmarkFill />}
          label="Library"
          href="#"
          active={activeItem === "Library"}
          onClick={() => setActiveItem("Library")}
        />
        <MenuItem
          icon={<BsPerson />}
          iconFill={<BsPersonFill />}
          label="Profile"
          href="#"
          active={activeItem === "Profile"}
          onClick={() => setActiveItem("Profile")}
        />
        <MenuItem
          icon={<BsFileText />}
          iconFill={<BsFileTextFill />}
          label="Stories"
          href="#"
          active={activeItem === "Stories"}
          onClick={() => setActiveItem("Stories")}
        />
        <MenuItem
          icon={<BsBarChart />}
          iconFill={<BsBarChartFill />}
          label="Stats"
          href="#"
          active={activeItem === "Stats"}
          onClick={() => setActiveItem("Stats")}
        />
      </ul>

      <hr className="my-8 border-gray-300" />

      <ul className="space-y-3">
        <MenuItem
          icon={<BsPeople />}
          iconFill={<BsFillPeopleFill />}
          label="Following"
          href="#"
          active={activeItem === "Following"}
          onClick={() => setActiveItem("Following")}
        />

        <li className="suggest-box flex items-start gap-4 px-3">
          <FiPlus className="mt-1 text-gray-600 text-3xl" />
          <div className="content flex flex-col gap-2">
            <p className="text-sm">Find writers and publications to follow.</p>
            <a href="#" className="underline">
              See suggestions
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default SideNavbar;
