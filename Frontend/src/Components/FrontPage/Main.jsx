import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../Redux/Features/AuthSlice.js";

const ModalContainer = ({ children, showAuthModal, setShowAuthModal }) => {
  const [modals, setModals] = useState({
    auth: false,
    otp: false,
    chat: false,
  });
  const [isOTP, setIsOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (showAuthModal) {
      handleModal("auth", true);
    }
  }, [showAuthModal]);

  const handleModal = (modalName, isOpen) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: isOpen,
      ...(modalName === "auth" && !isOpen && { otp: false }),
    }));
    if (modalName === "auth" && !isOpen) {
      setShowAuthModal(false);
    }
  };

  return (
    <>
      {children}
      {/* Modals */}
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

const Modal = ({
  userData,
  setUserData,
  setIsOTPModal,
  close,
  setOTP,
  showOTP,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const GenerateOTP = () => {
    let otpValue = "";
    for (let i = 0; i < 6; i++) {
      otpValue += Math.floor(Math.random() * 10);
    }
    setOTP(otpValue);
  };

  const Login = async () => {
    try {
      const res = await axios.post(
        "https://stocktrackpro-1.onrender.com/api/user/login",
        userData
      );

      if (res.status === 200) {
        document.cookie = `token=${res.data.token}`;
        dispatch(login({ user: userData, token: res.data.token }));
        navigate("/dashboard");
        close();
      }
    } catch (error) {
      console.log("error in login", error);
    }
  };

  const handleAuth = () => {
    GenerateOTP();
    showOTP();
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200 mx-4 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-end">
            <button
              onClick={close}
              className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Login to continue" : "Start your investment journey"}
            </p>
          </div>

          <div className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 text-left font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white border border-gray-200 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2 text-left font-medium">
                Email
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white border border-gray-200 outline-none transition-all"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-left font-medium">
                Password
              </label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white border border-gray-200 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              onClick={() => {
                if (!isLogin) {
                  setIsOTPModal();
                  handleAuth();
                } else {
                  Login();
                }
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 py-3.5 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>

            <div className="text-center text-gray-600 mt-4">
              {isLogin ? "New to us? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OTP = ({ userData, otp, close, setOTP }) => {
  const [timer, setTimer] = useState(30);
  const [otpValue, setOtpValue] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sendOTP = async () => {
    try {
      const res = await axios.post("https://stocktrackpro-1.onrender.com/api/user/OTPVerify", {
        email: userData.email,
        OTP: otp,
      });
    } catch (error) {
      console.log("OTP Error:", error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    sendOTP();
  }, []);

  const registerUser = async () => {
    try {
      const res = await axios.post(
        "https://stocktrackpro-1.onrender.com/api/user/register",
        userData
      );
      if (res.status === 200) {
        const userData = {
          Name: res.data.user.Name || "",
          EmailID: res.data.user.EmailID || "",
          PhoneNo: res.data.user.PhoneNo || "0",
          Stocks: res.data.user.Stocks || [],
          TotalAmount: res.data.user.TotalAmount || 0,
          WalletAmount: res.data.user.WalletAmount || 0,
          isVerified: res.data.user.isVerified || false,
          netProfit: res.data.user.netProfit || 0,
          annualReturn: res.data.user.annualReturn || 0,
        };
        document.cookie = `token=${res.data.token}`;
        dispatch(login({ user: userData, token: res.data.token }));
        navigate("/dashboard");
        close();
      }
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = () => {
    if (otpValue.join("") === otp) {
      registerUser();
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to {userData.email}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {otpValue.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-2xl text-center bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none border border-gray-200"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={verifyOTP}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 py-3.5 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg"
          >
            Verify OTP
          </button>

          <div className="text-center text-gray-600">
            {timer > 0 ? (
              `Resend OTP in ${timer}s`
            ) : (
              <button
                onClick={() => {
                  setTimer(30);
                  let otpValue = "";
                  for (let i = 0; i < 6; i++) {
                    otpValue += Math.floor(Math.random() * 10);
                  }
                  setOTP(otpValue);
                  sendOTP();
                }}
                className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatBot = ({ close, setModalState }) => {
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const [chat, setChat] = useState("AI");
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const userMessage = { text: e.target.value, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      // Simulate AI response after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm your AI trading assistant. How can I help you with market analysis today?",
            isUser: false,
          },
        ]);
        setLoading(false);
      }, 1000);

      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md h-[70vh] flex flex-col shadow-2xl rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Trading Assistant
              </h3>
              <p className="text-xs text-gray-500">
                {chat === "AI" ? "AI-powered insights" : "General support"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChat("AI")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                chat === "AI"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              AI
            </button>
            <button
              onClick={() => setChat("Normal")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                chat === "Normal"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Normal
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl max-w-[85%] shadow-sm ${
                msg.isUser
                  ? "bg-emerald-500 ml-auto text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-xl max-w-[85%] bg-white border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="relative">
            <input
              ref={inputRef}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white border border-gray-200 transition-all"
              placeholder={
                chat === "AI"
                  ? "Ask about market trends..."
                  : "Type your message..."
              }
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Close button outside the chat box */}
      <button
        onClick={() => {
          close();
          setModalState(false);
        }}
        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const Main = () => {
  const navigate = useNavigate();
  const state = useSelector((state) => state.Auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (!state.isLogged) {
      setShowAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <ModalContainer showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-xl -bottom-48 -right-48 animate-pulse delay-1000" />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <p className="text-2xl md:text-4xl font-light text-emerald-500">
              Empowering Your Trades, Simplifying Your Success
            </p>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
              Built for Growing India
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your comprehensive market analysis and trading companion with
              real-time data, advanced tools, and personalized insights.
            </p>
          </div>

          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default Main;
export { Modal, ChatBot, OTP,ModalContainer };