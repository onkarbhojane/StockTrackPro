import React, { useState, useEffect } from "react";
import profileImage from "../../assets/user.png";
import Navbar from "../FrontPage/Navbar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../Redux/Features/AuthSlice.js";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaGraduationCap,
  FaCrown,
  FaHistory,
  FaChartLine,
  FaMoneyBillWave,
  FaCoins,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaEdit,
  FaTrophy,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaClock,
  FaPercentage,
  FaDollarSign,
  FaEye,
  FaNewspaper,
} from "react-icons/fa";

const Profile = () => {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalBooks: 0,
    totalPremium: 0,
    totalTrades: 0,
    totalWatchlist: 0,
    totalSavedNews: 0,
    totalStocks: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (cookieToken) {
          const response = await axios.get(
            "http://localhost:8080/api/user/profiledata",
            {
              headers: {
                Authorization: `Bearer ${cookieToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Profile Data Response:", response.data);

          const res = response.data.data; // shortcut
          const userData = {
            _id: res._id || "",
            Name: res.Name || "",
            EmailID: res.EmailID || "",
            PhoneNo: res.PhoneNo || "0",
            Password: res.Password || "",
            Stocks: res.Stocks || [],
            TotalAmount: res.TotalAmount || 0,
            WalletAmount: res.WalletAmount || 0,
            isVerified: res.isVerified || false,
            netProfit: res.netProfit || 0,
            annualReturn: res.annualReturn || 0,
            PremiumPurchase: res.PremiumPurchase || {
              expiryDate: null,
              isPremium: false,
              purchaseDate: null,
            },
            Books: res.Books || [],
            Courses: res.Courses || [],
            SavedNews: res.SavedNews || [],
            Transactions: res.Transactions || [],
            Watchlist: res.Watchlist || [],
          };

          // Save in Redux
          dispatch(login({ user: userData, token: cookieToken }));

          // Calculate quick stats for UI
          setStats({
            totalCourses: userData.Courses.length,
            totalBooks: userData.Books.length,
            totalPremium: userData.PremiumPurchase.isPremium ? 1 : 0,
            totalTrades: userData.Transactions.length,
            totalWatchlist: userData.Watchlist.length,
            totalSavedNews: userData.SavedNews.length,
            totalStocks: userData.Stocks.length,
          });

          setLoading(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        dispatch(logout());
        navigate("/");
      }
    };

    fetchUserData();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar hide={false} />
        <div className="pt-20 px-8 max-w-7xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate portfolio value and performance
  const calculatePortfolioStats = () => {
    if (!user.Stocks || user.Stocks.length === 0) {
      return {
        portfolioValue: 0,
        initialInvestment: user.TotalAmount || 0,
        profitLoss: 0,
        profitLossPercentage: 0,
      };
    }

    const portfolioValue = user.Stocks.reduce(
      (total, stock) => total + (stock.currentPrice || stock.purchasePrice) * stock.quantity,
      0
    );
    
    const initialInvestment = user.TotalAmount || 0;
    const profitLoss = portfolioValue - initialInvestment;
    const profitLossPercentage = initialInvestment > 0 
      ? (profitLoss / initialInvestment) * 100 
      : 0;

    return {
      portfolioValue,
      initialInvestment,
      profitLoss,
      profitLossPercentage,
    };
  };

  const portfolioStats = calculatePortfolioStats();

  // Calculate paper trading summary stats
  const calculatePaperTradingStats = () => {
    if (!user.Transactions || user.Transactions.length === 0) {
      return {
        totalPL: 0,
        totalInvested: 0,
        winningTrades: 0,
        losingTrades: 0,
        mostTradedStock: null,
        avgTradeDuration: null,
        bestTrade: null,
        worstTrade: null,
      };
    }

    const trades = user.Transactions;
    let totalPL = 0;
    let totalInvested = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    const stockCounts = {};
    let totalDuration = 0;
    let validDurationTrades = 0;
    let bestTrade = null;
    let worstTrade = null;

    trades.forEach((trade) => {
      if (trade.pnl !== undefined && trade.pnl !== null) {
        totalPL += trade.pnl;
        totalInvested += trade.entryPrice * trade.quantity;

        if (trade.pnl >= 0) {
          winningTrades++;
        } else {
          losingTrades++;
        }

        // Track best and worst trades
        if (!bestTrade || trade.pnl > bestTrade.pnl) bestTrade = trade;
        if (!worstTrade || trade.pnl < worstTrade.pnl) worstTrade = trade;
      }

      // Count stock occurrences
      if (trade.symbol) {
        stockCounts[trade.symbol] = (stockCounts[trade.symbol] || 0) + 1;
      }

      // Calculate trade duration if exit time exists
      if (trade.exitTime && trade.entryTime) {
        const duration = new Date(trade.exitTime) - new Date(trade.entryTime);
        totalDuration += duration;
        validDurationTrades++;
      }
    });

    // Find most traded stock
    let mostTradedStock = null;
    let maxCount = 0;
    for (const [symbol, count] of Object.entries(stockCounts)) {
      if (count > maxCount) {
        mostTradedStock = symbol;
        maxCount = count;
      }
    }

    // Calculate average trade duration
    const avgTradeDuration =
      validDurationTrades > 0
        ? new Date(totalDuration / validDurationTrades)
        : null;

    return {
      totalPL,
      totalInvested,
      winningTrades,
      losingTrades,
      mostTradedStock,
      avgTradeDuration,
      bestTrade,
      worstTrade,
    };
  };

  const paperStats = calculatePaperTradingStats();
  const winRate =
    paperStats.winningTrades + paperStats.losingTrades > 0
      ? (
          (paperStats.winningTrades /
            (paperStats.winningTrades + paperStats.losingTrades)) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar hide={false} />
      <div className="pt-20 px-4 sm:px-8 max-w-7xl mx-auto pb-10">
        {/* Profile Header with Stats */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
                src={profileImage}
                alt="User profile"
              />
              {user.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {user.Name}
              </h1>
              <p className="text-blue-100 mb-4">{user.EmailID}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalCourses}</div>
                  <div className="text-sm text-blue-100">Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalBooks}</div>
                  <div className="text-sm text-blue-100">Books</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalPremium}</div>
                  <div className="text-sm text-blue-100">Premium</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalTrades}</div>
                  <div className="text-sm text-blue-100">Trades</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalStocks}</div>
                  <div className="text-sm text-blue-100">Stocks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{stats.totalWatchlist}</div>
                  <div className="text-sm text-blue-100">Watchlist</div>
                </div>
              </div>
            </div>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center">
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
          {[
            { id: "overview", label: "Overview", icon: FaUser },
            { id: "portfolio", label: "Portfolio", icon: FaChartLine },
            { id: "courses", label: "Courses", icon: FaGraduationCap },
            { id: "books", label: "Books", icon: FaBook },
            { id: "premium", label: "Premium", icon: FaCrown },
            { id: "history", label: "Trading History", icon: FaHistory },
            { id: "watchlist", label: "Watchlist", icon: FaEye },
            { id: "saved-news", label: "Saved News", icon: FaNewspaper },
            { id: "settings", label: "Settings", icon: FaCog },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Profile Overview
              </h2>

              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Portfolio Value</p>
                      <p className="text-xl font-bold text-blue-700">
                        ₹{portfolioStats.portfolioValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-200 p-2 rounded-full">
                      <FaChartLine className="text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    {portfolioStats.initialInvestment > 0 && (
                      <span>
                        Initial: ₹{portfolioStats.initialInvestment.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Total P&L</p>
                      <p
                        className={`text-xl font-bold ${
                          portfolioStats.profitLoss >= 0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        ₹{portfolioStats.profitLoss.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-200 p-2 rounded-full">
                      <FaMoneyBillWave className="text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    {portfolioStats.initialInvestment > 0 && (
                      <span>
                        {portfolioStats.profitLossPercentage.toFixed(2)}% ROI
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Wallet Balance</p>
                      <p className="text-xl font-bold text-purple-700">
                        ₹{user.WalletAmount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-purple-200 p-2 rounded-full">
                      <FaCoins className="text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    Available for trading
                  </div>
                </div>
              </div>

              {/* Trading Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Paper Trading P&L</p>
                      <p
                        className={`text-xl font-bold ${
                          paperStats.totalPL >= 0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        ₹{paperStats.totalPL.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-200 p-2 rounded-full">
                      <FaMoneyBillWave className="text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    {paperStats.totalInvested > 0 && (
                      <span>
                        {(
                          (paperStats.totalPL / paperStats.totalInvested) *
                          100
                        ).toFixed(2)}
                        % ROI
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Win Rate</p>
                      <p className="text-xl font-bold text-blue-700">
                        {winRate}%
                      </p>
                    </div>
                    <div className="bg-blue-200 p-2 rounded-full">
                      <FaTrophy className="text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    {paperStats.winningTrades}W / {paperStats.losingTrades}L
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">
                        Total Trades
                      </p>
                      <p className="text-xl font-bold text-purple-700">
                        {stats.totalTrades}
                      </p>
                    </div>
                    <div className="bg-purple-200 p-2 rounded-full">
                      <FaChartLine className="text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    {paperStats.mostTradedStock &&
                      `Most traded: ${paperStats.mostTradedStock}`}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 mb-1">
                        Member Since
                      </p>
                      <p className="text-xl font-bold text-amber-700">
                        {new Date().getFullYear() - 1}
                      </p>
                    </div>
                    <div className="bg-amber-200 p-2 rounded-full">
                      <FaMedal className="text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">
                    {user.isVerified ? "Verified Account" : "Basic Account"}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {user.Courses?.slice(0, 2).map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FaGraduationCap className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          Started course: {course.title || "Unknown Course"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(course.purchaseDate)}
                        </p>
                      </div>
                      <div className="text-blue-600 text-sm font-medium">
                        {course.progress || 0}% complete
                      </div>
                    </div>
                  ))}

                  {user.Transactions && user.Transactions
                    .slice(0, 2)
                    .map((trade, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full mr-3 ${
                            trade.pnl >= 0 ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {trade.pnl >= 0 ? (
                            <FaArrowUp className="text-green-600" />
                          ) : (
                            <FaArrowDown className="text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {trade.type} {trade.symbol}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(trade.entryTime)}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {trade.pnl >= 0 ? "+" : ""}₹
                          {Math.abs(trade.pnl || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}

                  {user.Courses?.length === 0 &&
                    (!user.Transactions || user.Transactions.length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        <p>No recent activity yet</p>
                      </div>
                    )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-center transition-colors"
                  >
                    <FaChartLine className="text-blue-600 mx-auto mb-2 text-xl" />
                    <span className="text-sm font-medium text-gray-700">
                      My Portfolio
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-center transition-colors"
                  >
                    <FaGraduationCap className="text-green-600 mx-auto mb-2 text-xl" />
                    <span className="text-sm font-medium text-gray-700">
                      My Courses
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-center transition-colors"
                  >
                    <FaHistory className="text-purple-600 mx-auto mb-2 text-xl" />
                    <span className="text-sm font-medium text-gray-700">
                      Trading History
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-amber-50 hover:bg-amber-100 p-3 rounded-lg text-center transition-colors"
                  >
                    <FaChartLine className="text-amber-600 mx-auto mb-2 text-xl" />
                    <span className="text-sm font-medium text-gray-700">
                      Trade Now
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                My Portfolio
              </h2>
              
              {user.Stocks && user.Stocks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Investment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          P&L
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.Stocks.map((stock, index) => {
                        const investment = stock.purchasePrice * stock.quantity;
                        const currentValue = (stock.currentPrice || stock.purchasePrice) * stock.quantity;
                        const pnl = currentValue - investment;
                        const pnlPercentage = (pnl / investment) * 100;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {stock.symbol}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {stock.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{stock.purchasePrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{(stock.currentPrice || stock.purchasePrice).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{investment.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{currentValue.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={pnl >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaChartLine className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No stocks in portfolio
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start trading to build your portfolio
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Trading
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  My Courses
                </h2>
                <button
                  onClick={() => navigate("/knowledge_center")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Browse Courses
                </button>
              </div>
              {user.Courses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.Courses.map((course, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-blue-100 to-blue-200 h-40 rounded-lg mb-4 flex items-center justify-center">
                        <FaGraduationCap className="text-blue-500 text-4xl" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {course.title || "Unknown Course"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Purchased on {formatDate(course.purchaseDate)}
                      </p>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        {course.progress > 0
                          ? "Continue Learning"
                          : "Start Learning"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Explore our courses to start your learning journey
                  </p>
                  <button
                    onClick={() => navigate("/courses")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "books" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  My Books
                </h2>
                <button
                  onClick={() => navigate("/books")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Browse Books
                </button>
              </div>
              {user.Books?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {user.Books.map((book, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-green-100 to-green-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                        <FaBook className="text-green-500 text-4xl" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {book.title || "Unknown Book"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        by {book.author || "Unknown Author"}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Purchased on {formatDate(book.purchaseDate)}
                      </p>
                      <button
                        onClick={() => window.open(book.downloadLink, "_blank")}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaBook className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No books yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Explore our library to find valuable resources
                  </p>
                  <button
                    onClick={() => navigate("/books")}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Browse Books
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "premium" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Premium Status
                </h2>
                {!user.PremiumPurchase?.isPremium && (
                  <button
                    onClick={() => navigate("/premium")}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
              
              {user.PremiumPurchase?.isPremium ? (
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-600 text-white p-3 rounded-full mr-4">
                      <FaCrown className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-purple-800">Premium Member</h3>
                      <p className="text-purple-600">You have access to all premium features</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Purchase Date</p>
                      <p className="font-medium">{formatDate(user.PremiumPurchase.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Expiry Date</p>
                      <p className="font-medium">{formatDate(user.PremiumPurchase.expiryDate)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaCrown className="text-purple-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Not a premium member yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Upgrade to premium to access exclusive features and content
                  </p>
                  <button
                    onClick={() => navigate("/premium")}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Explore Premium
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Trading History
              </h2>
              {user.Transactions && user.Transactions.length > 0 ? (
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-500 mr-3 text-xl" />
                        <div>
                          <p className="text-sm text-green-700">Total P&L</p>
                          <p
                            className={`text-xl font-bold ${
                              paperStats.totalPL >= 0
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            ₹{paperStats.totalPL.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <FaCoins className="text-blue-500 mr-3 text-xl" />
                        <div>
                          <p className="text-sm text-blue-700">
                            Total Invested
                          </p>
                          <p className="text-xl font-bold text-blue-700">
                            ₹{paperStats.totalInvested?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <FaChartLine className="text-purple-500 mr-3 text-xl" />
                        <div>
                          <p className="text-sm text-purple-700">Win Rate</p>
                          <p className="text-xl font-bold text-purple-700">
                            {winRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center">
                        <FaCrown className="text-amber-500 mr-3 text-xl" />
                        <div>
                          <p className="text-sm text-amber-700">Most Traded</p>
                          <p className="text-xl font-bold text-amber-700">
                            {paperStats.mostTradedStock || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Trades Table */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="font-medium mb-4 text-gray-800">
                      Recent Trades
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Entry Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Exit Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              P&L
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.Transactions.map((trade, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(trade.entryTime)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {trade.symbol}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    trade.type === "BUY"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {trade.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {trade.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                ₹{trade.entryPrice?.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {trade.exitPrice
                                  ? `₹${trade.exitPrice.toFixed(2)}`
                                  : "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {trade.pnl !== undefined ? (
                                  <span
                                    className={
                                      trade.pnl >= 0
                                        ? "text-green-600 font-medium"
                                        : "text-red-600 font-medium"
                                    }
                                  >
                                    {trade.pnl >= 0 ? "+" : ""}₹
                                    {Math.abs(trade.pnl).toFixed(2)}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaHistory className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No trading history yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start paper trading to build your portfolio
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Trading
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                My Watchlist
              </h2>
              {user.Watchlist && user.Watchlist.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Symbol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.Watchlist.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {item.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{item.currentPrice?.toFixed(2) || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.change !== undefined ? (
                              <span className={item.change >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {item.change >= 0 ? "+" : ""}{item.change?.toFixed(2)}%
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate(`/stock/${item.symbol}`)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate("/dashboard", { state: { symbol: item.symbol } })}
                              className="text-green-600 hover:text-green-800"
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaEye className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Watchlist is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add stocks to your watchlist to track them easily
                  </p>
                  <button
                    onClick={() => navigate("/stocks")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Stocks
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved-news" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Saved News
              </h2>
              {user.SavedNews && user.SavedNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.SavedNews.map((news, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-800 mb-2">{news.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{news.summary}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{formatDate(news.publishedAt)}</span>
                        <button
                          onClick={() => window.open(news.url, "_blank")}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          Read Full Article
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaNewspaper className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No saved news articles
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Save interesting news articles to read them later
                  </p>
                  <button
                    onClick={() => navigate("/news")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse News
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Account Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-medium mb-4 text-gray-800">
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.Name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.EmailID}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user.PhoneNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Update Profile
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-medium mb-4 text-gray-800">Security</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left py-2 px-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      Change Password
                    </button>
                    <button className="w-full text-left py-2 px-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      Two-Factor Authentication
                    </button>
                    <button className="w-full text-left py-2 px-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      Connected Devices
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl md:col-span-2">
                  <h3 className="font-medium mb-4 text-gray-800">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <button className="text-red-600 border border-red-300 px-4 py-2 rounded-md text-sm hover:bg-red-50">
                      Deactivate Account
                    </button>
                    <button
                      className="flex items-center text-red-600 px-4 py-2 rounded-md text-sm hover:bg-red-50"
                      onClick={() => {
                        dispatch(logout());
                        navigate("/");
                      }}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;