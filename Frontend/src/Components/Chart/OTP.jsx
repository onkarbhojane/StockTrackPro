import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OTP = ({ close }) => {  // Added close prop for modal dismissal
  const [timer, setTimer] = useState(30);
  const [otpValue, setOtpValue] = useState(Array(6).fill(""));
  const [otp, setOtp] = useState("");  // Changed to string type
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const user = useSelector(state => state.Auth.user);  // Fixed selector syntax
  const cookieToken = document.cookie.split('=')[1];  // Get cookie token (adjust based on your auth setup)

  const generateOTP = () => {
    let newOtp = "";
    for (let i = 0; i < 6; i++) {
      newOtp += Math.floor(Math.random() * 10);
    }
    setOtp(newOtp);
    return newOtp;
  };

  const sendOTP = async (generatedOTP) => {
    try {
      await axios.post(
        "https://stocktrackpro-2.onrender.com/stock/verification",
        {
          email: user.EmailID,
          OTP: generatedOTP,
        },
        {
          headers: {
            Authorization: `Bearer ${cookieToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("OTP Error:", error.response?.data?.message || error.message);
      setError("Failed to send OTP. Please try again.");
    }
  };
  const Transaction=useSelector(state=>state.StockCart);
  useEffect(() => {
    const initialOTP = generateOTP();
    console.log("ttttttttttttttttttttttttt",Transaction)
    sendOTP(initialOTP);
  }, []);

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
    const enteredOtp = otpValue.join("");
    if (enteredOtp === otp) {
      navigate('/stock/verification/done');
      close?.();  // Close modal if provided
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = () => {
    setTimer(30);
    setError("");
    const newOtp = generateOTP();
    sendOTP(newOtp);
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="text-black hover:text-gray-900 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-emerald-400 mb-4">
            Verify OTP
          </h1>
          <p className="text-gray-700">
            We've sent a 6-digit code to {user?.EmailID}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-3 text-black">
            {otpValue.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-2xl text-center bg-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={verifyOTP}
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-lg font-semibold text-white transition-colors"
          >
            Verify OTP
          </button>

          <div className="text-center text-gray-700">
            {timer > 0 ? (
              `Resend OTP in ${timer}s`
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-emerald-400 hover:text-emerald-500 underline"
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

export default OTP;