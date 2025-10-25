import { useState } from "react";
import MenuItem from "./MenuItem";
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
import { useLocation } from "react-router";

const SideNavbar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div>
      <ul className="space-y-3">
        <MenuItem
          icon={<BsHouse />}
          activeIcon={<BsHouseFill />}
          label="Home"
          href="/home"
          active={path === "/home"}
        />
        <MenuItem
          icon={<BsBookmark />}
          activeIcon={<BsBookmarkFill />}
          label="Library"
          href="/library"
          active={path === "/library"}
        />
        <MenuItem
          icon={<BsPerson />}
          activeIcon={<BsPersonFill />}
          label="Profile"
          href="/profile"
          active={path === "/profile"}
        />
        <MenuItem
          icon={<BsFileText />}
          activeIcon={<BsFileTextFill />}
          label="Stories"
          href="/stories"
          active={path === "/stories"}
        />
        <MenuItem
          icon={<BsBarChart />}
          activeIcon={<BsBarChartFill />}
          label="Stats"
          href="/stat"
          active={path === "/stat"}
        />
      </ul>

      <hr className="my-8 border-gray-300" />

      <ul className="space-y-3">
        <MenuItem
          icon={<BsPeople />}
          activeIcon={<BsFillPeopleFill />}
          label="Following"
          href="#"
          active={path === "/following"}
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
