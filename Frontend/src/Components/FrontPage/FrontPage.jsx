import React, { useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Main from "./Main.jsx";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../Redux/Features/AuthSlice.js";
import { AddStock } from "../../Redux/Features/StocksCart.js";
const FrontPage = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from cookies
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (cookieToken) {
          const response = await axios.get(
            "https://stocktrackpro-ozwl.onrender.com/api/user/profiledata",
            {
              headers: {
                Authorization: `Bearer ${cookieToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(response.data.data, "frontpage");
          // Ensure response structure matches Redux expectations
          const userData = {
            Name: response.data.data.Name || "",
            EmailID: response.data.data.EmailID || "",
            PhoneNo: response.data.data.PhoneNo || "0",
            Stocks: response.data.data.Stocks || [],
            TotalAmount: response.data.data.TotalAmount || 0,
            WalletAmount: response.data.data.WalletAmount || 0,
            isVerified: response.data.data.isVerified || false,
            // Calculated fields (initialize if not provided)
            netProfit: response.data.data.netProfit || 0,
            annualReturn: response.data.data.annualReturn || 0,
          };

          response.data.data.Stocks.map((stock) => {
            dispatch(
              AddStock({
                symbol: stock.symbol,
                quantity: stock.quantity,
                avgPrice: stock.avgPrice,
                totalInvested: stock.totalInvested,
                lastUpdated: new Date().toISOString(),
                currentPrice: stock.avgPrice,
              })
            );
          });

          dispatch(
            login({
              user: userData,
              token: cookieToken,
            })
          );

          console.log(state.Auth);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // Clear invalid credentials
        dispatch(logout());
        // Optionally redirect to login
        // navigate('/login');
      }
    };

    fetchUserData();
  }, [dispatch]); // Add dependencies if needed
  return (
    <>
      <Navbar />
      <Main />
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">StockTrack Pro</h3>
              <p className="text-gray-400 text-sm">
                Your comprehensive market analysis and trading companion.
              </p>
            </div>
            <div>
              <h4 className="text-md font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Subscribe to our platform for updates
              </p>
              <div className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400 text-center">
            <p>
              © {new Date().getFullYear()} StockTrack Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
export default FrontPage;
