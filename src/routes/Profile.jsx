import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/SideNavbar";
import "../css/HomeDashboard.css";

const Profile = () => {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showRightSide, setShowRightSide] = useState(window.innerWidth >= 720);
  const [smallScreen, setSmallScreen] = useState(window.innerWidth < 720);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSideNav(!mobile);
      setShowRightSide(window.innerWidth >= 720);
      setSmallScreen(window.innerWidth < 720);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userName = "userName";
  const bio = "text";
  const readingList = null;

  return (
    <div className="home-grid min-h-lvh">
      <div className="fixed top-0 left-0 right-0 h-14 z-60">
        <Navbar onToggleSideNav={() => setShowSideNav((v) => !v)} />
      </div>

      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ease-in-out lg:hidden
            ${showSideNav ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={() => setShowSideNav(false)}
        />
      )}

      <div
        className={`fixed top-14 left-0 h-[calc(100%-56px)] w-60 border-r border-gray-200 bg-white p-4 overflow-y-auto z-50
          transform transition-all duration-300 ease-in-out
          ${showSideNav
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <SideNavbar />
      </div>

      <main
        className={`pt-16 p-6 transition-all duration-300 relative z-10
                ${!isMobile && showSideNav ? "ml-60" : ""}
                ${showRightSide ? "mr-96" : ""}`}
      >
        <div className="py-20">
          <div className="space-y-4">
            {!showRightSide && smallScreen && (
              <>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                  alt="profile-pic"
                  className="w-24 h-24 object-cover rounded-full"
                />
                <h5 className="my-2">{userName}</h5>
              </>
            )}
            <a
              href="#"
              className="block p-4 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <h2 className="text-xl font-bold mb-4">Reading list</h2>
              <div>
                {readingList && readingList.length > 0 ? (
                  <p className="text-gray-600">
                    {readingList[0]}, {readingList[1]}, {readingList[2]},...
                  </p>
                ) : (
                  <p className="text-gray-600">
                    You have no items in your reading list.
                  </p>
                )}
              </div>
            </a>
          </div>
        </div>
      </main>

      {showRightSide && (
        <div className="fixed top-14 right-0 h-[calc(100%-56px)] w-96 bg-300 border-l border-gray-200 p-4">
          <div className="">
            <div className="mx-2 my-3 flex flex-col items-start">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                alt="profile-pic"
                className="w-24 h-24 object-cover rounded-full"
              />
              <h5 className="my-2">{userName}</h5>
              <p className="text-xs text-gray-600">{bio}</p>
              <a
                href="#"
                className="mt-7 text-sm text-green-700 cursor-pointer hover:text-violet-900"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
