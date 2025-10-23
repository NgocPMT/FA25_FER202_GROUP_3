import { useState } from "react";
import { Link } from "react-router";
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
} from "react-icons/bs";
import { FiPlus } from "react-icons/fi";

const MenuItem = ({ icon, activeIcon, label, href, active, onClick }) => {
  return (
    <li
      onClick={onClick}
      className="relative group flex items-center gap-4 pl-4 pr-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-all"
    >
      <span
        className={`absolute top-0 -left-3.5 h-full w-0.5 rounded-r transition-colors ${
          active ? "bg-gray-800" : "bg-transparent"
        }`}
      ></span>

      <span
        className={`text-xl transition-colors ${
          active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
        }`}
      >
        {active ? activeIcon : icon}
      </span>

      <Link
        to={href}
        className={`flex-1 transition-colors duration-150 ${
          active
            ? "text-gray-900 font-medium"
            : "text-gray-500 group-hover:text-gray-800"
        }`}
      >
        {label}
      </Link>
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
          activeIcon={<BsHouseFill />}
          label="Home"
          href="/home"
          active={activeItem === "Home"}
          onClick={() => setActiveItem("Home")}
        />
        <MenuItem
          icon={<BsBookmark />}
          activeIcon={<BsBookmarkFill />}
          label="Library"
          href="/library"
          active={activeItem === "Library"}
          onClick={() => setActiveItem("Library")}
        />
        <MenuItem
          icon={<BsPerson />}
          activeIcon={<BsPersonFill />}
          label="Profile"
          href="/profile"
          active={activeItem === "Profile"}
          onClick={() => setActiveItem("Profile")}
        />
        <MenuItem
          icon={<BsFileText />}
          activeIcon={<BsFileTextFill />}
          label="Stories"
          href="/stories"
          active={activeItem === "Stories"}
          onClick={() => setActiveItem("Stories")}
        />
        <MenuItem
          icon={<BsBarChart />}
          activeIcon={<BsBarChartFill />}
          label="Stats"
          href="/stat"
          active={activeItem === "Stats"}
          onClick={() => setActiveItem("Stats")}
        />
      </ul>

      <hr className="my-8 border-gray-300" />

      <ul className="space-y-3">
        <MenuItem
          icon={<BsPeople />}
          activeIcon={<BsFillPeopleFill />}
          label="Following"
          href="#"
          active={activeItem === "Following"}
          onClick={() => setActiveItem("Following")}
        />

        <li className="suggest-box flex items-start gap-4 px-3">
          <FiPlus className="mt-1 text-gray-500 text-3xl" />
          <div className="content flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              Find writers and publications to follow.
            </p>
            <a
              href="#"
              className="underline text-gray-500 group-hover:text-gray-800"
            >
              See suggestions
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default SideNavbar;
