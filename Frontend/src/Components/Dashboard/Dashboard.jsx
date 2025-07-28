import React, { useState, useEffect } from "react";
import Navbar from "../FrontPage/Navbar";
import { Line, Bar } from "react-chartjs-2";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../Redux/Features/AuthSlice";
import {
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaCoins,
  FaToolbox,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("stocks");
  const [timeRange, setTimeRange] = useState("1D");
  const [marketData, setMarketData] = useState(null);
  const [indices, setIndices] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moversLoading, setMoversLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        const response = await axios.get(
          "https://www.nseindia.com/api/live-analysis-variations?index=loosers"
        );
        setTopGainers(response.data.gainers);
        setTopLosers(response.data.losers);
        setMoversLoading(false);
      } catch (error) {
        console.error("Error fetching top movers data:", error);
        setMoversLoading(false);
      }
    };

    fetchTopMovers();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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

          const userData = {
            Name: response.data.data.Name || "",
            EmailID: response.data.data.EmailID || "",
            PhoneNo: response.data.data.PhoneNo || "0",
            Stocks: response.data.data.Stocks || [],
            TotalAmount: response.data.data.TotalAmount || 0,
            WalletAmount: response.data.data.WalletAmount || 0,
            isVerified: response.data.data.isVerified || false,
            netProfit: response.data.data.netProfit || 0,
            annualReturn: response.data.data.annualReturn || 0,
          };

          dispatch(login({ user: userData, token: cookieToken }));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        dispatch(logout());
        navigate("/");
      }
    };

    const fetchMarketData = async () => {
      try {
        // Fetch market indices
        const indicesResponse = await axios.get(
          "https://stocktrackpro-ozwl.onrender.com/service/market-indices"
        );
        setIndices(indicesResponse.data);

        // Fetch chart data
        const chartResponse = await axios.get(
          "https://stocktrackpro-ozwl.onrender.com/service/market-chart"
        );
        setMarketData({
          labels: chartResponse.data.labels,
          datasets: [
            {
              label: "Market Index",
              data: chartResponse.data.values,
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
    fetchMarketData();
  }, [dispatch, navigate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        borderColor: "#374151",
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: { callback: (value) => `₹${value}` },
      },
    },
    interaction: { mode: "nearest", intersect: false },
  };

  const smallChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { point: { radius: 0 } },
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false } },
  };

  const tools = [
    {
      name: "AI Predictions",
      icon: <FaChartLine className="text-blue-600 text-xl" />,
      description: "AI-powered stock price predictions and trend analysis",
      route: "/ai-predictions",
    },
    {
      name: "Portfolio Builder",
      icon: <FaToolbox className="text-blue-600 text-xl" />,
      description: "Build and optimize your investment portfolio",
      route: "/portfolio-builder",
    },
    {
      name: "Options Calculator",
      icon: <FaCoins className="text-blue-600 text-xl" />,
      description: "Advanced options trading calculator with Greeks",
      route: "/options-calculator",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Navbar
        hide={false}
        chat={true}
        searchBar={true}
        profile={true}
        display="static"
        chatlogo={true}
        searchPlaceholder="Search stocks, indices..."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Market Overview
            </h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {["1D", "1W", "1M", "1Y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeRange === range
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Market Performance</h2>
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : marketData ? (
              <Line data={marketData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No chart data available
              </div>
            )}
          </div>
        </div>

        {/* Indices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-40 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              ))
          ) : indices.length > 0 ? (
            indices.map((index, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => navigate(`/index/${index.symbol}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {index.name}
                    </h3>
                    <p className="text-2xl font-bold mt-2">{index.value}</p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      index.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {index.change}
                  </span>
                </div>
                <div className="h-20 mt-4">
                  <Line
                    data={{
                      labels: [],
                      datasets: [
                        {
                          data:
                            index.chartData ||
                            Array(10)
                              .fill(0)
                              .map((_, i) => Math.random() * 100),
                          borderColor: index.change.startsWith("+")
                            ? "#16a34a"
                            : "#dc2626",
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={smallChartOptions}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No indices data available
            </div>
          )}
        </div>

        {/* Top Gainers/Losers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Gainers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Top Gainers</h2>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => navigate("/top-movers?type=gainers")}
              >
                View All
              </button>
            </div>
            {moversLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
            ) : topGainers.length > 0 ? (
              topGainers.map((stock, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 px-2 rounded transition-colors cursor-pointer"
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{stock.symbol}</h3>
                      <p className="text-sm text-gray-500">NSE</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stock.ltp?.toLocaleString('en-IN') || 'N/A'}</p>
                    <span className="text-green-600 flex items-center justify-end gap-1 text-sm font-medium">
                      <FaArrowUp /> {stock.perChange?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No gainers data available
              </div>
            )}
          </div>

          {/* Top Losers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Top Losers</h2>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => navigate("/top-movers?type=losers")}
              >
                View All
              </button>
            </div>
            {moversLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
            ) : topLosers.length > 0 ? (
              topLosers.map((stock, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 px-2 rounded transition-colors cursor-pointer"
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-red-600 rotate-180" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{stock.symbol}</h3>
                      <p className="text-sm text-gray-500">NSE</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stock.ltp?.toLocaleString('en-IN') || 'N/A'}</p>
                    <span className="text-red-600 flex items-center justify-end gap-1 text-sm font-medium">
                      <FaArrowDown /> {Math.abs(stock.perChange)?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No losers data available
              </div>
            )}
          </div>
        </div>

        {/* Trading Tools Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-6">Trading Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="p-6 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => navigate(tool.route)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">{tool.icon}</div>
                  <h3 className="font-semibold">{tool.name}</h3>
                </div>
                <p className="text-gray-500 text-sm">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Summary (only shown if logged in) */}
        {user && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              Your Portfolio Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Total Value
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  ₹{user.TotalAmount?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Net Profit
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  ₹{user.netProfit?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800 mb-2">
                  Annual Return
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {user.annualReturn?.toFixed(2)}%
                </p>
              </div>
            </div>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => navigate("/portfolio")}
            >
              View Full Portfolio
            </button>
          </div>
        )}
      </div>

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
                Subscribe to our newsletter for updates
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
    </div>
  );
};

export default Dashboard;