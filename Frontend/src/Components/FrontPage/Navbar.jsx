import React, { useEffect, useState, useRef } from "react";
import { Modal, ChatBot, OTP } from "./Main";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login, logout } from "../../Redux/Features/AuthSlice";
import profileImage from "../../assets/user.png";

const Navbar = ({
  hide = true,
  chat,
  setModalState,
  searchBar = true,
  profile = true,
  display = "fixed",
  chatlogo = true,
  searchPlaceholder = "Search stocks...",
}) => {   
  const [searchModal, setSearchModal] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isModalChat, setIsModalChat] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const location = useLocation();

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const userState = useSelector((state) => state);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const toolsRef = useRef(null);
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  const state = useSelector((state) => state.Auth.isLogged);
  const dispatch = useDispatch();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    try {
      const res = await axios.get(
        `https://stocktrackpro-1.onrender.com/service/stocksearch?name=${value.toUpperCase()}`
      );
      setSearchResults([...res.data]);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const [modals, setModals] = useState({
    auth: false,
    otp: false,
    chat: false,
  });

  const handleModal = (modalName, isOpen) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: isOpen,
      ...(modalName === "auth" && !isOpen && { otp: false }),
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchModal(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`bg-white shadow-lg ${display} w-full z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8 flex-1">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              StockTrack Pro
            </h1>

            {searchBar && (
              <div className="relative flex-1 max-w-xl" ref={searchRef}>
                <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 space-x-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    className="flex-1 bg-transparent outline-none placeholder-gray-500 text-gray-700"
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={handleSearch}
                    onFocus={() => setSearchModal(true)}
                  />
                  {search && (
                    <button
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setSearch("")}
                    >
                      ×
                    </button>
                  )}
                </div>

                {searchModal && searchResults.length > 0 && (
                  <div className="absolute mt-1 w-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 z-50">
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((item, index) => (
                        <div
                          key={index}
                          className="px-6 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                          onClick={() => {
                            setSearch(item);
                            setSearchModal(false);
                            navigate(`/stock/${item}`);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-emerald-600">
                              {item}
                            </span>
                            <span className="text-gray-500 text-sm">NSE</span>
                          </div>
                          <div className="mt-1 text-gray-600 text-sm">
                            Technology Sector
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors shadow-sm hover:shadow-md"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span>Tools</span>
              </button>

              {isToolsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/news")}
                  >
                    Market News
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() =>{
                      if(state) {
                        navigate("/AlgoTrade")
                      }else handleModal("auth", true)
                    }}
                  >
                    Algo Trades
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/calculators")}
                  >
                    Calculators
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/trading-analysis")}
                  >
                    Trading Analysis
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/paper-trading")}
                  >
                    Paper Trading
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/portfolio-builder")}
                  >
                    Portfolio Builder
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => navigate("/knowledge_center")}
                  >
                    Learning Courses
                  </button>
                </div>
              )}
            </div>

            {/* Chat Button */}
            {chat && chatlogo && (
              <button
                className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-gray-700 shadow-sm hover:shadow-md"
                onClick={() => handleModal("chat", true)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Chat</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {state ? (
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 shadow-sm hover:shadow-md"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="relative">
                    <img
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                      src={profileImage}
                      alt="Profile"
                    />
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-emerald-500"></span>
                  </div>
                  <span className="text-gray-700 font-medium">{userData.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    </div>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 ${
                        location.pathname === "/user/profile"
                          ? "bg-gray-50 text-emerald-600"
                          : "text-gray-700"
                      } transition-colors`}
                      onClick={() => {
                        if (location.pathname !== "/user/profile") {
                          navigate("/user/profile");
                        }
                        setIsProfileOpen(false);
                      }}
                    >
                      Profile Settings
                    </button>
                    {/* <button
                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                      onClick={() => {
                        navigate("/account");
                        setIsProfileOpen(false);
                      }}
                    >
                      Account
                    </button> */}
                    <button
                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-red-600 transition-colors"
                      onClick={() => {
                        dispatch(logout());
                        document.cookie = "token=";
                        navigate("/");
                        setIsProfileOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              hide && (
                <button
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 px-4 py-2 rounded-lg transition-all text-white shadow-md hover:shadow-lg"
                  onClick={() => handleModal("auth", true)}
                >
                  Login/Register
                </button>
              )
            )}

            {/* More Options Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => {
                      navigate("/about");
                      setIsMoreOpen(false);
                    }}
                  >
                    About
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => {
                      navigate("/help-center");
                      setIsMoreOpen(false);
                    }}
                  >
                    Help Center
                  </button>
                  <button
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => {
                      navigate("/documentation");
                      setIsMoreOpen(false);
                    }}
                  >
                    Documentation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {modals.auth && (
        <Modal
          userData={userData}
          setUserData={setUserData}
          close={() => handleModal("auth", false)}
          showOTP={() => {
            handleModal("auth", false);
            handleModal("otp", true);
          }}
          setOTP={setOtp}
          setIsOTPModal={() => {
            handleModal("auth", false);
            setIsOTP(true);
          }}
        />
      )}

      {isOTP && (
        <OTP
          userData={userData}
          otp={otp}
          close={() => setIsOTP(false)}
          setOTP={setOtp}
        />
      )}

      {modals.chat && (
        <ChatBot
          close={() => handleModal("chat", false)}
          setModalState={(state) => handleModal("chat", state)}
        />
      )}
    </>
  );
};

export default Navbar;