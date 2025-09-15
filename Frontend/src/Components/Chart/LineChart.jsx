import React, { useEffect, useState, useRef, useCallback } from "react";
import { Line } from "react-chartjs-2";
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
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../FrontPage/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { AddStock, InitTransaction } from "../../Redux/Features/StocksCart";
import { login, logout } from "../../Redux/Features/AuthSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const LineChart = () => {
  const { symbol } = useParams();
  const chartRef = useRef(null);
  const [stockData, setStockData] = useState({
    symbol: symbol,
    price: 0,
    change: 0,
    changePercent: 0,
    historical: [],
    high: 0,
    low: 0,
    marketCap: "0",
    peRatio: "0",
    roce: "0",
  });
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stock = useSelector((state) => state.StockCart.stockList);
  const refb = useRef(null);
  const [chartInterval, setChartInterval] = useState("Daily");
  const [isPurchased, setIsPurchased] = useState(false);
  const [totalQts, setTotalQts] = useState(0);
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  // Process historical data from backend
  const processHistoricalData = useCallback((dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    
    return dataArray.map(item => ({
      date: new Date(item.Date),
      close: item.Close
    }));
  }, []);

  // Reset historical data and symbol when symbol changes
  useEffect(() => {
    setStockData((prev) => ({
      ...prev,
      symbol: symbol,
      historical: [],
    }));
  }, [symbol]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStockData = async () => {
      try {
        console.log(symbol + " " + chartInterval);
        const response = await axios.get(
          "http://localhost:8080/service/stockprice",
          {
            params: { symbol, type: chartInterval },
            signal: abortController.signal,
          }
        );
        console.log(response.data, "response data");

        // Handle both single object and array responses
        let dataArray = Array.isArray(response.data) ? response.data : [response.data];
        
        if (dataArray.length === 0) {
          setLoading(false);
          return;
        }

        // Process the historical data
        const historicalData = processHistoricalData(dataArray);
        
        // Get the latest data point
        const latestData = dataArray[dataArray.length - 1];
        const firstData = dataArray[0];
        
        const stockPrice = latestData.Close;
        const prevClose = firstData.Open;
        const change = stockPrice - prevClose;
        const changePercent = (change / prevClose) * 100;

        // Calculate high and low from the entire dataset
        const highs = dataArray.map(item => item.High);
        const lows = dataArray.map(item => item.Low);
        const todayHigh = Math.max(...highs);
        const todayLow = Math.min(...lows);
        
        setStockData((prev) => ({
          ...prev,
          symbol: symbol,
          price: stockPrice,
          change,
          changePercent,
          high: todayHigh,
          low: todayLow,
          marketCap: latestData.marketCap ?? prev.marketCap,
          peRatio: latestData.peRatio ?? prev.peRatio,
          historical: historicalData,
        }));
        setLoading(false);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching stock data:", error);
          setLoading(false);
        }
      }
    };

    const now = new Date();
    let intervalId = null;
    const isMarketTime =
      now.getDay() >= 1 &&
      now.getDay() <= 5 &&
      ((now.getHours() === 9 && now.getMinutes() >= 15) ||
        (now.getHours() > 9 && now.getHours() < 15) ||
        (now.getHours() === 15 && now.getMinutes() <= 30));

    if (chartInterval === "Daily" && isMarketTime) {
      intervalId = setInterval(fetchStockData, 5000);
    } else {
      fetchStockData();
    }

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [symbol, chartInterval, processHistoricalData]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/service/stocknews?symbol=${symbol}`
        );
        console.log(response.data.news);
        setNews(response.data.news || []);
      } catch (err) {
        setError(err.message);
      }
    };
    
    const stocksList = user.Stocks?.find(
      (s) => s.symbol === stockData.symbol && s.quantity > 0
    );
    setIsPurchased(stocksList ? true : false);
    setTotalQts(stocksList?.quantity || 0);

    fetchNews();
  }, [symbol, user, stockData.symbol]);

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

          response.data.data.Stocks.forEach((stock) => {
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

          dispatch(login({ user: userData, token: cookieToken }));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        dispatch(logout());
      }
    };

    fetchUserData();
  }, [dispatch]);

  useEffect(() => {
    const calculatedPrice = price || stockData.price;
    const calculatedQuantity = parseFloat(quantity) || 0;
    setEstimatedCost(calculatedQuantity * calculatedPrice);
  }, [quantity, price, stockData.price]);

  const handleBuy = () => {
    if (user.WalletAmount >= estimatedCost && estimatedCost > 0) {
      dispatch(
        InitTransaction({
          Symbol: stockData.symbol,
          Quantity: quantity,
          avgPrice: stockData.price,
          estimatedCost: estimatedCost,
          type: "BUY",
        })
      );
      navigate("/stock/verification/done");
    }
  };

  const handleSell = () => {
    const stocksList = user.Stocks?.find(
      (s) => s.symbol === stockData.symbol && s.quantity > 0
    );
    if (!stocksList || stocksList.quantity < quantity || quantity <= 0) return;
    const calculatedPrice = price || stockData.price;
    const calculatedQuantity = parseFloat(quantity) || 0;
    const estimatedCost = calculatedQuantity * calculatedPrice;

    dispatch(
      InitTransaction({
        Symbol: stockData.symbol,
        Quantity: quantity,
        avgPrice: stockData.price,
        estimatedCost: estimatedCost,
        type: "SELL",
      })
    );
    navigate("/stock/verification/done");
  };

  // Function to check if a time is within market hours (9:15 AM to 3:30 PM)
  const isMarketTime = (date) => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    
    // Before market opens
    if (hour < 9 || (hour === 9 && minutes < 15)) return false;
    
    // After market closes
    if (hour > 15 || (hour === 15 && minutes > 30)) return false;
    
    return true;
  };

  // Generate background shading for non-trading hours
  const getChartBackground = (chart) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return null;
    
    const { left, right } = chartArea;
    const xScale = scales.x;
    
    // Create gradient for background
    const gradient = ctx.createLinearGradient(left, 0, right, 0);
    
    // Define market open and close times for today
    const now = new Date();
    const marketOpen = new Date(now);
    marketOpen.setHours(9, 15, 0, 0);
    
    const marketClose = new Date(now);
    marketClose.setHours(15, 30, 0, 0);
    
    // Calculate positions for market open and close
    const openPos = (xScale.getPixelForValue(marketOpen) - left) / (right - left);
    const closePos = (xScale.getPixelForValue(marketClose) - left) / (right - left);
    
    // Add color stops for pre-market, market hours, and post-market
    gradient.addColorStop(0, '#f5f5f5'); // Pre-market
    gradient.addColorStop(openPos - 0.001, '#f5f5f5'); // End of pre-market
    gradient.addColorStop(openPos, '#ffffff'); // Market open
    gradient.addColorStop(closePos, '#ffffff'); // Market close
    gradient.addColorStop(closePos + 0.001, '#f5f5f5'); // Start of post-market
    gradient.addColorStop(1, '#f5f5f5'); // Post-market
    
    return gradient;
  };

  const chartData = {
    datasets: [
      {
        label: "Price (₹)",
        data: stockData.historical.map((data) => ({
          x: data.date,
          y: data.close,
        })),
        borderColor: stockData.change >= 0 ? "#16a34a" : "#dc2626",
        backgroundColor: (context) => {
          if (!context.chart.ctx) return;
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(
            0,
            stockData.change >= 0 ? "#16a34a22" : "#dc262622"
          );
          gradient.addColorStop(1, "#ffffff00");
          return gradient;
        },
        tension: 0.1,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        segment: {
          borderColor: ctx => {
            const point = ctx.p0.parsed;
            return point.y >= (ctx.p1?.parsed.y || point.y) ? "#16a34a" : "#dc2626";
          },
        },
      },
    ],
  };

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
        callbacks: {
          title: (items) =>
            items[0]?.parsed.x
              ? new Date(items[0].parsed.x).toLocaleTimeString()
              : "",
          label: (context) => `₹${context.parsed.y?.toFixed(2) || "0.00"}`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: chartInterval === "Daily" ? "hour" : 
                chartInterval === "Weekly" ? "day" : "month",
          tooltipFormat: "MMM dd, yyyy HH:mm",
          displayFormats: {
            hour: "HH:mm",
            day: "MMM dd",
            month: "MMM yyyy"
          }
        },
        grid: { 
          display: true,
          color: (context) => {
            const value = context.tick.value;
            return isMarketTime(new Date(value)) ? "#e5e7eb" : "transparent";
          }
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          callback: (value) => {
            const date = new Date(value);
            return isMarketTime(date) ? date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '';
          }
        }
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: { 
          callback: (value) => `₹${value}`,
          maxTicksLimit: 6
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: { mode: "nearest", intersect: false },
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 pt-20 space-y-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {stockData.symbol}
                  <span className="ml-2 text-lg text-gray-600">NSE</span>
                </h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ₹{stockData.price?.toFixed(2) || "0.00"}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stockData.change >= 0 ? "text-green-700" : "text-red-700"
                  } bg-${
                    stockData.change >= 0 ? "green" : "red"
                  }-100 px-2 py-1 rounded-full inline-block mt-1`}
                >
                  {stockData.change >= 0 ? "+" : "-"}₹
                  {Math.abs(stockData.change || 0).toFixed(2)} (
                  {Math.abs(stockData.changePercent || 0).toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-gray-600 mb-1">Market Cap</div>
                <div className="font-semibold text-gray-800">
                  {stockData.marketCap}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-gray-600 mb-1">Today's High</div>
                <div className="font-semibold text-gray-800">
                  ₹{stockData.high?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-gray-600 mb-1">Today's Low</div>
                <div className="font-semibold text-gray-800">
                  ₹{stockData.low?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-gray-600 mb-1">P/E Ratio</div>
                <div className="font-semibold text-gray-800">
                  {stockData.peRatio}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div
                  onClick={() => navigate("/AlgoTrade")}
                  className="px-6 py-2 rounded-2xl font-medium shadow-sm border border-gray-200 bg-white 
               text-gray-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 
               hover:text-indigo-700 cursor-pointer transition-all duration-300"
                >
                  Try Algos?
                </div>

                <div className="flex gap-3 text-sm">
                  {["Daily", "Weekly", "Yearly"].map((label) => (
                    <div
                      key={label}
                      onClick={() => setChartInterval(label)}
                      className={`px-6 py-2 rounded-2xl font-medium shadow-sm border border-gray-200 bg-white 
          cursor-pointer transition-all duration-300
          ${
            chartInterval === label
              ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
              : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700"
          }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-96 relative">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : stockData.historical.length > 0 ? (
                  <>
                    <Line
                      key={symbol + chartInterval}
                      ref={chartRef}
                      data={chartData}
                      options={chartOptions}
                    />
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm text-gray-600 shadow-sm">
                      Market Hours: 9:15 AM - 3:30 PM
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No historical data available
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex gap-2 mb-6">
                <button
                  className={`flex-1 py-2 rounded transition-colors ${
                    orderType === "market"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setOrderType("market")}
                >
                  Market
                </button>
                <button
                  className={`flex-1 py-2 rounded transition-colors ${
                    orderType === "limit"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setOrderType("limit")}
                >
                  Limit
                </button>
              </div>

              <div className="space-y-4">
                {orderType === "limit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limit Price (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 text-black border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={`Current: ₹${stockData.price.toFixed(2)}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded text-black focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      if (refb.current) {
                        refb.current.style.backgroundColor =
                          user.WalletAmount <
                          e.target.value * (price || stockData.price)
                            ? "#ef4444"
                            : "#16a34a";
                      }
                    }}
                    placeholder={`Available: ${Math.floor(
                      user.WalletAmount / (stockData.price || 1)
                    )}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-medium">Available Cash</span>
                    <span className="font-semibold">
                      ₹{user.WalletAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-medium">Estimated Cost</span>
                    <span className="font-semibold">
                      ₹
                      {estimatedCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {isPurchased && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span className="font-medium">Current Quantities</span>
                      <span className="font-semibold">
                        You will sell {quantity} out of {totalQts} shares
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    ref={refb}
                    onClick={handleBuy}
                    disabled={user.WalletAmount < estimatedCost || estimatedCost <= 0}
                    className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Buy {stockData.symbol}
                  </button>
                  <button
                    onClick={handleSell}
                    disabled={!isPurchased || totalQts < quantity || quantity <= 0}
                    className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Sell {stockData.symbol}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Market orders execute immediately at current price. Limit
                  orders only execute at specified price or better.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Latest Stock News
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length > 0 ? news.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 whitespace-pre-line">
                    {item.title?.replace(/\n/g, " ")}
                  </h3>
                </a>

                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                  <span className="font-medium text-blue-600">
                    {item.source}
                  </span>
                  <span className="text-gray-400">{item.time}</span>
                </div>
              </div>
            )) : (
              <div className="text-center p-6 text-gray-500 col-span-3">
                No news available for {symbol}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-10 bg-white"></div>
      <footer className="bg-gray-800 text-white py-8 ">
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
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.040 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
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
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.40-1.439-1.40z" />
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
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.790-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
    </>
  );
};

export default LineChart;