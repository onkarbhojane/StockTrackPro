import React, { useEffect, useState, useRef } from "react";
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

    console.log(new Date().getDay(), "qqqqqqqqqqqqq");
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          "https://stocktrackpro-ozwl.onrender.com/service/stockprice",
          {
            params: { symbol },
            signal: abortController.signal,
          }
        );
        const data = response.data;

        const parseCurrency = (str) => parseFloat(str.replace(/[^0-9.]/g, ""));
        const stockPrice = parseCurrency(data.stockPrice);
        const prevClose = parseCurrency(data.prevClose);
        const change = stockPrice - prevClose;
        const changePercent = (change / prevClose) * 100;

        const [todayLow, todayHigh] = data.todayRange
          .split(" - ")
          .map(parseCurrency);
        const [yearLow, yearHigh] = data.yearRange
          .split(" - ")
          .map(parseCurrency);

        setStockData((prev) => {
          const newHistorical = [
            ...prev.historical,
            { date: new Date(), close: stockPrice },
          ];
          if (newHistorical.length > 50) newHistorical.shift();

          return {
            ...prev,
            symbol: symbol,
            price: stockPrice,
            change: change,
            changePercent: changePercent,
            high: todayHigh,
            low: todayLow,
            marketCap: data.marketCap,
            peRatio: data.peRatio,
            historical: newHistorical,
          };
        });
        setLoading(false);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching stock data:", error);
        }
      }
    };
    let intervalId = null;
    const day = new Date();
    if (
      day.getDay() >= 0 &&
      day.getDay() <= 5 &&
      day.getHours() >= 9 &&
      day.getHours() <= 15
    ) {
      intervalId = setInterval(fetchStockData, 5000);
    } else {
      fetchStockData();
    }

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [symbol]);

  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://stocktrackpro-ozwl.onrender.com/service/stocknews?symbol=${symbol}`
        );
        console.log(response.data.news);
        setNews(response.data.news);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);
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
      navigate("/buy/verification");
    }
  };

  const handleSell = () => {
    console.log("Sell order submitted:", {
      quantity,
      price: price || stockData.price,
      total: estimatedCost,
    });
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
          unit: "minute",
          tooltipFormat: "HH:mm:ss",
          displayFormats: {
            minute: "HH:mm",
          },
        },
        grid: { display: false },
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: { callback: (value) => `₹${value}` },
      },
    },
    animation: {
      duration: 1000,
      easing: "linear",
    },
    interaction: { mode: "nearest", intersect: false },
  };

  return (
    <>
      <Navbar hide={false} />
      <div className=" bg-gray-50 pt-20 space-y-4">
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
                  ₹{stockData.price.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stockData.change >= 0 ? "text-green-700" : "text-red-700"
                  } bg-${
                    stockData.change >= 0 ? "green" : "red"
                  }-100 px-2 py-1 rounded-full inline-block mt-1`}
                >
                  {stockData.change >= 0 ? "+" : "-"}₹
                  {Math.abs(stockData.change).toFixed(2)} (
                  {Math.abs(stockData.changePercent).toFixed(2)}%)
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
                  ₹{stockData.high?.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-gray-600 mb-1">Today's Low</div>
                <div className="font-semibold text-gray-800">
                  ₹{stockData.low?.toFixed(2)}
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
              <div className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Line
                    key={symbol}
                    ref={chartRef}
                    data={chartData}
                    options={chartOptions}
                  />
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
                            ? "#ACE1AF"
                            : "green";
                      }
                    }}
                    placeholder="Enter shares"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span className="font-medium">Available Cash</span>
                    <span className="font-semibold">
                      ₹{user.WalletAmount.toLocaleString()}
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
                </div>

                <div className="space-y-2">
                  <button
                    ref={refb}
                    onClick={handleBuy}
                    className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Buy {stockData.symbol}
                  </button>
                  <button
                    onClick={handleSell}
                    className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Latest Stock News
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {news.map((item, index) => (
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
                    {item.title.replace(/\n/g, " ")}
                  </h3>
                </a>

                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                  <span className="font-medium text-blue-600">
                    {item.source}
                  </span>
                  <span className="text-gray-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          {news.length === 0 && (
            <div className="text-center p-6 text-gray-500">
              No news available
            </div>
          )}
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
    </>
  );
};

export default LineChart;
