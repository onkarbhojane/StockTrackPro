import axios from "axios";
import React, { useState, useEffect } from "react";

const Courses = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load the Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  const PurchaseItem = async (item) => {
    if (!razorpayLoaded) {
      alert("Razorpay is still loading. Please try again in a moment.");
      return;
    }

    try {
      // Retrieve token from cookies
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!cookieToken) {
        alert("Please login first");
        return;
      }

      // Step 1: Create an order from the backend
      const { data } = await axios.post(
        "http://localhost:8080/payment/create-order",
        {
          amount: 100, // Adjust the amount as needed
          currency: "INR",
        },
        {
          headers: {
            Authorization: `Bearer ${cookieToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!data.success || !data.order) {
        alert("Failed to create order");
        return;
      }

      const { id: order_id, amount: order_amount, currency } = data.order;

      // Step 2: Initialize Razorpay options
      const options = {
        key: "rzp_test_2v9Xo7vBBoF5Rl", // Replace with your Razorpay key
        amount: order_amount,
        currency,
        name: "Stock App",
        description: "Stock purchase payment",
        order_id,
        handler: async (response) => {
          // Step 3: Verify payment on the backend
          const verifyRes = await axios.post(
            "http://localhost:8080/payment/verify-payment",
            response,
            {
              headers: {
                Authorization: `Bearer ${cookieToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (verifyRes.data.success) {
            alert("Payment Successful");
          } else {
            alert("Payment Failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      // Step 4: Create and open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Failed");
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center ml-25">
              <span className="text-2xl font-bold text-emerald-600">
                StockTrack Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-30">
              {["Home", "courses", "Podcast", "Books", "Blog"].map((item) => (
                <a
                  key={item}
                  onClick={() => {
                    if (item === "Home") {
                      window.location.href = "/";
                    } else if (item === "courses") {
                      window.location.href = "/courses";
                    } else if (item === "Podcast") {
                      window.location.href = "/podcast";
                    } else if (item === "Books") {
                      window.location.href = "/books";
                    } else if (item === "Blog") {
                      window.location.href = "/blog";
                    }
                  }}
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors mr-25">
              Join Community
            </button>
          </div>
        </div>
      </nav>

      {/* Courses Section */}
      <div className="bg-gray-100 h-screen flex flex-wrap gap-8 text-black pt-10 justify-center">
        {[
          "SIP",
          "TECHNICAL ANALYSIS",
          "FUNDAMENTAL ANALYSIS",
          "STOCK MARKET",
          "PERSONAL FINANCE",
          "MUTUAL FUND",
        ].map((item, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
            className="h-50 w-80 bg-white rounded-xl shadow-2xl hover:h-52 hover:w-82 transition-all flex flex-col justify-center items-center"
          >
            <h2 className="text-xl font-bold text-center">{item}</h2>
            {hoveredItem === item && (
              <button
                onClick={() => PurchaseItem(item)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors mt-4"
              >
                Purchase
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">StockTrack Pro</h3>
              <p className="text-gray-400 text-sm">
                Empowering traders with real-time insights and advanced
                analytics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Markets</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Stocks", "Options", "Futures", "Forex"].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Research", "Education", "Blog", "Webinars"].map(
                  (item, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Disclosures",
                  "Cookie Settings",
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} StockTrack Pro. All rights reserved.
            </p>
            <p className="mt-2">
              Data provided by financial data providers. Delayed by 15 minutes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Courses;
