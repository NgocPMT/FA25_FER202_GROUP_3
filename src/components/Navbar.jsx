import { useState, useEffect } from "react";
import { Menu, Bell, Pen, Search, X } from "lucide-react";
import { RxAvatar } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useLogOut from "../hooks/useLogOut";
import { useLoader } from "@/context/LoaderContext";

const Navbar = ({ onToggleSideNav }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null); // null = loading
  const { showLoader, hideLoader } = useLoader();
  const token = localStorage.getItem("token");
  const logOut = useLogOut();
  const location = useLocation();
  const navigate = useNavigate();
  const bellActive = location.pathname === "/notifications";

  const handleBellClick = () => {
    if (location.pathname === "/notifications") {
      navigate(-1);
    } else {
      navigate("/notifications");
    }
  };


  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        showLoader();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/validate-token`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setIsValidToken(false);
      } finally {
        hideLoader();
      }
    };

    validateToken();
  }, [token]);

  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between flex-wrap px-4 py-3 w-full min-w-0">
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
          <button
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            onClick={onToggleSideNav}
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link
            to="/home"
            className="font-lora font-bold text-2xl text-gray-900 truncate"
          >
            Easium
          </Link>
        </div>

        <div className="hidden [@media(min-width:727px)]:flex justify-center flex-1 min-w-0 px-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full max-w-xs border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 [@media(max-width:900px)]:max-w-[200px]"
          />
        </div>

        {token || isValidToken ? (
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <Link
              to="/write"
              className="hidden [@media(min-width:727px)]:flex items-center gap-1 px-3 py-1 border rounded-full text-sm hover:bg-gray-100"
            >
              <Pen className="w-4 h-4" />
              <span>Write</span>
            </Link>

            <button
              onClick={handleBellClick}
              className="hidden [@media(min-width:727px)]:block p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className={`w-5 h-5 ${bellActive ? "text-amber-500" : ""}`} />
            </button>

            <button
              className="p-2 rounded-full hover:bg-gray-100 [@media(min-width:727px)]:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            <div className="relative w-8 h-8 ">
              <button
                onClick={toggleAvatarDropdownShow}
                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold cursor-pointer flex-shrink-0 overflow-hidden"
              >
                <RxAvatar className="w-full h-full text-black" />
              </button>
              {isAvatarDropdownShow && (
                <div className="bg-white top-10 right-0 absolute w-fit">
                  <button
                    onClick={logOut}
                    className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t [@media(min-width:727px)]:hidden ${showSearch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {showSearch && (
          <div className="px-4 py-3 bg-white">
            <input
              type="text"
              placeholder="Search Easium..."
              autoFocus
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
