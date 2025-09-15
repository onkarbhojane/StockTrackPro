import axios from "axios";
import React, { useState } from "react";
// import { PdfReader } from "pdfreader";
const Books = () => {
  const ReadBook = async (item) => {
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_API || "http://localhost:8080"
        }/api/user/purchase`,
        { item }
      );
    } catch (error) {
      console.log("error in purchasing items, ", error);
    }
  };
  return (
    <div>
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo/Name */}
            <div className="flex items-center ml-25">
              <span className="text-2xl font-bold text-emerald-600">
                StockTrack Pro
              </span>
            </div>

            {/* Navigation Links */}
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

            {/* CTA Button */}
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors mr-25">
              Join Community
            </button>
          </div>
        </div>
      </nav>
      <div className="bg-gray-100 h-screen flex flex-row flex-wrap gap-8 text-black pt-10">
        {new PdfReader().parseFileItems(
          "./Onkar_Bhojane_VITPune.pdf",
          (err, item) => {
            if (err) console.error("error:", err);
            else if (!item) console.warn("end of file");
            else if (item.text) console.log(item.text);
          }
        )}
      </div>
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
                        className="hover:text-blue-400 transition-colors"
                        onClick={() => {
                          if (item === "Education") {
                            navigate("/knowledge_center");
                          }
                        }}
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

export default Books;
