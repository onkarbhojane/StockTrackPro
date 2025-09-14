import React, { useState, useEffect } from "react";
import profileImage from "../../assets/user.png";
import Navbar from "../FrontPage/Navbar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../Redux/Features/AuthSlice.js";
import { useNavigate } from "react-router-dom";
import { FaBook, FaGraduationCap, FaCrown, FaHistory, FaChartLine, FaMoneyBillWave, FaCoins } from "react-icons/fa";
import Dashboard from './../Dashboard/Dashboard';

const Profile = () => {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (cookieToken) {
          const response = await axios.get(
            "https://ai-script-writter-website.onrender.com/api/user/profiledata",
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
            Courses: response.data.data.Courses || [],
            Books: response.data.data.Books || [],
            PremiumPurchases: response.data.data.PremiumPurchases || [],
            PaperTradingStats: response.data.data.PaperTradingStats || {},
            isVerified: response.data.data.isVerified || false,
          };

          dispatch(login({ user: userData, token: cookieToken }));
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate paper trading summary stats
  const calculatePaperTradingStats = () => {
    if (!user.PaperTradingStats || !user.PaperTradingStats.recentTrades) {
      return {
        totalPL: 0,
        totalInvested: 0,
        winningTrades: 0,
        losingTrades: 0,
        mostTradedStock: null,
        avgTradeDuration: null
      };
    }

    const trades = user.PaperTradingStats.recentTrades;
    let totalPL = 0;
    let totalInvested = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    const stockCounts = {};
    let totalDuration = 0;
    let validDurationTrades = 0;

    trades.forEach(trade => {
      if (trade.pnl !== undefined && trade.pnl !== null) {
        totalPL += trade.pnl;
        totalInvested += trade.entryPrice * trade.quantity;
        
        if (trade.pnl >= 0) {
          winningTrades++;
        } else {
          losingTrades++;
        }
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
    const avgTradeDuration = validDurationTrades > 0 
      ? new Date(totalDuration / validDurationTrades) 
      : null;

    return {
      totalPL,
      totalInvested,
      winningTrades,
      losingTrades,
      mostTradedStock,
      avgTradeDuration
    };
  };

  const paperStats = calculatePaperTradingStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar hide={false} />

      <div className="pt-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Profile Header */}
        <h1>nksjndclkajnsdckl</h1>
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="flex items-center">
            <div className="relative">
              <img
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
                src={profileImage}
                alt="User profile"
              />
              {user.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4 sm:ml-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{user.Name}</h1>
              <p className="text-sm text-gray-600">{user.EmailID}</p>
              <p className="text-xs text-gray-500 mt-1">
                Member since {new Date().getFullYear() - 1}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('courses')}
          >
            <FaGraduationCap className="inline mr-2" />
            My Courses
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'books' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('books')}
          >
            <FaBook className="inline mr-2" />
            My Books
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'premium' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('premium')}
          >
            <FaCrown className="inline mr-2" />
            Premium Purchases
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="inline mr-2" />
            Paper Trading History
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          {activeTab === 'courses' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">My Courses</h2>
              {({...user.Courses}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.Courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="bg-gray-100 h-40 rounded-md mb-3 flex items-center justify-center text-gray-400">
                        Course Thumbnail
                      </div>
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">Purchased on {formatDate(course.purchaseDate)}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{course.progress}% completed</span>
                        <button 
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Continue
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't purchased any courses yet</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'books' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">My Books</h2>
              {({...user.Books}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {user.Books.map((book) => (
                    <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="bg-gray-100 h-48 rounded-md mb-3 flex items-center justify-center text-gray-400">
                        Book Cover
                      </div>
                      <h3 className="font-medium text-gray-800">{book.title}</h3>
                      <p className="text-sm text-gray-500">by {book.author}</p>
                      <p className="text-sm text-gray-500 mt-1">Purchased on {formatDate(book.purchaseDate)}</p>
                      <button 
                        onClick={() => window.open(book.downloadLink, '_blank')}
                        className="w-full mt-3 bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't purchased any books yet</p>
                  <button
                    onClick={() => navigate('/books')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Browse Books
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'premium' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">Premium Purchases</h2>
              {({...user.PremiumPurchases}).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.PremiumPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{purchase.itemName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {purchase.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(purchase.purchaseDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{purchase.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              purchase.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any premium purchases yet</p>
                  <button
                    onClick={() => navigate('/premium')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Explore Premium
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">Paper Trading History</h2>
              {user.Transactions && Object.keys(user.Transactions).length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Total P&L</p>
                          <p className={`text-2xl font-bold ${
                            paperStats.totalPL >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ₹{paperStats.totalPL.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {paperStats.totalInvested > 0 
                              ? `${((paperStats.totalPL / paperStats.totalInvested) * 100).toFixed(2)}% ROI` 
                              : '0% ROI'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaCoins className="text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Total Invested</p>
                          <p className="text-2xl font-bold">
                            ₹{paperStats.totalInvested.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.PaperTradingStats.totalTrades || 0} trades
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaChartLine className="text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Win Rate</p>
                          <p className="text-2xl font-bold">
                            {paperStats.winningTrades + paperStats.losingTrades > 0
                              ? `${(paperStats.winningTrades / (paperStats.winningTrades + paperStats.losingTrades) * 100).toFixed(1)}%`
                              : '0%'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {paperStats.winningTrades}W / {paperStats.losingTrades}L
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaCrown className="text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Most Traded</p>
                          <p className="text-2xl font-bold">
                            {paperStats.mostTradedStock || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {paperStats.avgTradeDuration 
                              ? `Avg hold: ${Math.floor(paperStats.avgTradeDuration / (1000 * 60 * 60 * 24))}d` 
                              : 'No duration data'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recent Trades</h3>
                    {(user.PaperTradingStats.recentTrades || []).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Entry
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Exit
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P&L
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {user.PaperTradingStats.recentTrades.map((trade, index) => {
                              const duration = trade.exitTime && trade.entryTime
                                ? new Date(trade.exitTime) - new Date(trade.entryTime)
                                : null;
                              const durationDays = duration 
                                ? Math.floor(duration / (1000 * 60 * 60 * 24))
                                : null;
                              const durationHours = duration 
                                ? Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                : null;

                              return (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {trade.symbol}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      trade.type === 'BUY' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {trade.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {trade.quantity}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    ₹{trade.entryPrice.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {trade.exitPrice ? `₹${trade.exitPrice.toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {trade.pnl !== undefined ? (
                                      <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        ₹{Math.abs(trade.pnl).toFixed(2)} ({trade.pnl >= 0 ? '+' : ''}{((trade.pnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)}%)
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {durationDays !== null && durationHours !== null
                                      ? `${durationDays}d ${durationHours}h`
                                      : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent trades found</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't made any paper trades yet</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Start Paper Trading
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;