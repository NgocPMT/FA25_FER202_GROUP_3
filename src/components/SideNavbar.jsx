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
  BsEnvelope,
  BsEnvelopeFill
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
          label="Follows"
          href="/following"
          active={path === "/following"}
        />
        <MenuItem
          icon={<BsPeople />}
          activeIcon={<BsFillPeopleFill />}
          label="Publication"
          href="/publications"
          active={path.startsWith("/publications")}
        />
        <MenuItem
          icon={<BsEnvelope />}
          activeIcon={<BsEnvelopeFill />}
          label="Invitations"
          href="/my-invitations"
          active={path === "/my-invitations"}
        />
      </ul>

    </div>
  );
};

export default SideNavbar;
