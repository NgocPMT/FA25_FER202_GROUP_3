import { useState, useEffect } from "react";
import { Menu, Bell, Pen, Search, X } from "lucide-react";
import { RxAvatar } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useLogOut from "../hooks/useLogOut";
import { useLoader } from "@/context/LoaderContext";
import { IoSearchOutline } from "react-icons/io5";
import { toast } from "react-toastify";

const Navbar = ({ onToggleSideNav }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAvatarDropdownShow, setIsAvatarDropdownShow] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { showLoader, hideLoader } = useLoader();
  const token = localStorage.getItem("token");
  const logOut = useLogOut();
  const location = useLocation();
  const navigate = useNavigate();
  const bellActive = location.pathname === "/notifications";

  const [searchQuery, setSearchQuery] = useState("");

  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("searchHistory") || "[]");
  });

  const saveSearchHistory = (keyword) => {
    if (!keyword.trim()) return;

    const updated = [
      keyword,
      ...searchHistory.filter((item) => item !== keyword),
    ].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const removeHistoryItem = (item) => {
    const updated = searchHistory.filter((i) => i !== item);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  useEffect(() => {
    if (!token) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;

        const data = await res.json();

        const unread = data.filter(n => !n.isRead).length;

        setUnreadCount(unread);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUnread();
  }, [token]);


  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController
    const signal = controller.signal; // Get its signal

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
            headers: { Authorization: `Bearer ${token}` },
            signal, // Attach the abort signal
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setIsValidToken(data.valid);

        if (!data.valid) localStorage.removeItem("token");
      } catch (error) {
        // Ignore AbortError (when request is canceled)
        if (error.name !== "AbortError") {
          setIsValidToken(false);
        }
      } finally {
        // Hide loader only if not aborted
        if (!signal.aborted) hideLoader();
      }
    };

    validateToken();

    // Cleanup function: abort fetch when unmounting or token changes
    return () => {
      controller.abort();
    };
  }, [token]);

  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController
    const signal = controller.signal; // Get its signal

    const validateAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/validate-admin`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setIsAdmin(data.valid);
      } catch (error) {
        // Ignore AbortError (when request is canceled)
        if (error.name !== "AbortError") {
          setIsAdmin(false);
        }
      }
    };

    validateAdmin();

    // Cleanup function: abort fetch when unmounting or token changes
    return () => {
      controller.abort();
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); // Create controller
    const signal = controller.signal; // Get its signal

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal, // Attach abort signal
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error);
          return;
        }

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        // Ignore AbortError (user navigated away, etc.)
        if (error.name !== "AbortError") {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();

    // Cleanup — abort fetch if component unmounts
    return () => {
      controller.abort();
    };
  }, [token]);

useEffect(() => {
  const handleRead = () => setUnreadCount(0);

  window.addEventListener("notifications-read", handleRead);
  return () => window.removeEventListener("notifications-read", handleRead);
}, []);


  const toggleAvatarDropdownShow = () => {
    setIsAvatarDropdownShow(!isAvatarDropdownShow);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      saveSearchHistory(searchQuery);
      setShowDropdown(false);
      navigate(`/home?query=${encodeURIComponent(searchQuery)}&page=1&limit=5`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onToggleSideNav}
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link
            to="/home"
            className="font-lora font-bold text-2xl text-gray-900"
          >
            Easium
          </Link>
        </div>

        <div className="relative w-full max-w-xs hidden md:block">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            className="w-full max-w-xs border border-gray-300 rounded-full px-10 py-1 focus:outline-none text-sm focus:ring-0 bg-gray-50 focus:bg-gray-100 "
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchEnter}
          />

          {showDropdown && (
            <div className=" absolute top-11 w-full max-w-xs bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-200 z-50 ">
              <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>{" "}
              {/*MŨI TÊN DROPDOWN */}
              <div className="px-4 py-2  font-semibold text-xs tracking-wide text-gray-500">
                RECENT SEARCHES
              </div>
              {searchHistory.length === 0 && (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  No recent searches
                </div>
              )}
              {searchHistory
                .filter((item) =>
                  item.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 group"
                    onClick={() => {
                      saveSearchHistory(item);
                      setSearchQuery(item);
                      setShowDropdown(false);
                      navigate(
                        `/home?query=${encodeURIComponent(item)}&page=1&limit=5`
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IoSearchOutline className="text-gray-400 text-lg" />
                      <span className="truncate">{item}</span>
                    </div>

                    <button
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(item);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {searchHistory.length > 0 && (
                <div className="px-4 py-2 text-center border-t border-gray-200">
                  <button
                    className="text-xs text-black-500 hover:underline"
                    onClick={clearAllHistory}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {showSearch && (
          <div className="fixed inset-0 bg-white z-[60] flex flex-col p-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchEnter}
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none bg-gray-50"
              />
              <button
                className="ml-2 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowSearch(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-2">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">
                Recent searches
              </h3>
              {searchHistory.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent searches</p>
              ) : (
                <div className="space-y-2">
                  {searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        saveSearchHistory(item);
                        setSearchQuery(item);
                        setShowSearch(false);
                        navigate(
                          `/home?query=${encodeURIComponent(
                            item
                          )}&page=1&limit=5`
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <IoSearchOutline className="text-gray-400" />
                        <span>{item}</span>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(item);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {token && isValidToken ? (
          <div className="flex items-center gap-2">
            <Link
              to="/write"
              className="hidden md:flex items-center gap-1 px-3 py-1 border rounded-full hover:bg-gray-100"
            >
              <Pen className="w-4 h-4" />
              <span>Write</span>
            </Link>

            <Link
              to="/notifications"
              className="hidden md:block p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Bell
                className={`w-5 h-5 ${bellActive ? "text-amber-500" : ""}`}
              />

              {unreadCount > 0 && (
                <span
                  className="
        absolute -top-1 -right-1 
        bg-red-500 text-white text-xs 
        w-4 h-4 flex items-center justify-center 
        rounded-full
      "
                >
                  {unreadCount}
                </span>
              )}
            </Link>


            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
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
                <img
                  src={
                    profile?.avatarUrl ||
                    "https://rugdjovtsielndwerjst.supabase.co/storage/v1/object/public/avatars/user-icon.webp"
                  }
                  className="w-full h-full object-center object-cover"
                />
              </button>
              {isAvatarDropdownShow && (
                <div className="bg-white top-10 right-0 absolute w-fit">
                  {isAdmin && (
                    <Link
                      to="/admin/reports"
                      className="cursor-pointer hover:bg-gray-400 p-1 whitespace-nowrap inline-block"
                    >
                      Admin Dashboard
                    </Link>
                  )}
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
    </nav>
  );
};

export default Navbar;
