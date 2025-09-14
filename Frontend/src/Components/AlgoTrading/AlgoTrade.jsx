import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
} from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Generate more realistic sample data with indicators
const generateSampleData = (basePrice = 100, volatility = 0.8) => {
  const data = [];
  let currentPrice = basePrice;
  let volumeBase = 10000;

  // Initialize indicator values
  let ema12 = basePrice;
  let ema26 = basePrice;
  let prevEma12 = basePrice;
  let prevEma26 = basePrice;
  let macd = 0;
  let signal = 0;
  let rsi = 50;
  let prevGain = 0;
  let prevLoss = 0;
  for (let i = 9; i <= 15; i++) {
    if (i === 12) continue;

    for (let j = 0; j < 60; j += 5) {
      // More granular data points for HFT
      if (i === 15 && j > 30) break;

      const time = `${i}:${j === 0 ? "00" : j}`;

      // More realistic price movement with momentum
      const change = (Math.random() - 0.48) * volatility;
      currentPrice += change;

      // Calculate EMA12 and EMA26
      const k12 = 2 / (12 + 1);
      const k26 = 2 / (26 + 1);
      ema12 = currentPrice * k12 + prevEma12 * (1 - k12);
      ema26 = currentPrice * k26 + prevEma26 * (1 - k26);

      // Calculate MACD and Signal
      macd = ema12 - ema26;
      signal = macd * 0.2 + signal * 0.8;

      // Calculate RSI (simplified)
      const priceChange =
        currentPrice -
        (data.length > 0 ? data[data.length - 1].price : basePrice);
      if (data.length > 0) {
        if (priceChange > 0) {
          prevGain = (prevGain * 13 + priceChange) / 14;
          prevLoss = (prevLoss * 13) / 14;
        } else {
          prevGain = (prevGain * 13) / 14;
          prevLoss = (prevLoss * 13 - priceChange) / 14;
        }
        rsi = 100 - 100 / (1 + prevGain / (prevLoss || 1));
      }

      prevEma12 = ema12;
      prevEma26 = ema26;

      data.push({
        time,
        price: parseFloat(currentPrice.toFixed(2)),
        ema12: parseFloat(ema12.toFixed(2)),
        ema26: parseFloat(ema26.toFixed(2)),
        macd: parseFloat(macd.toFixed(2)),
        signal: parseFloat(signal.toFixed(2)),
        rsi: parseFloat(rsi.toFixed(2)),
        volume: Math.floor(Math.random() * volumeBase) + volumeBase / 2,
      });

      // Adjust volume based on price movement
      volumeBase = Math.max(5000, volumeBase + (change > 0 ? 500 : -500));
    }
  }

  return data;
};

// Generate AI suggested stocks
const generateAISuggestions = () => {
  return [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp",
      confidence: 92,
      reasoning: "Strong earnings growth and AI sector momentum",
      target: 510,
      stopLoss: 450,
      timeframe: "1-2 weeks",
      data: generateSampleData(480, 1.2),
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      confidence: 87,
      reasoning: "Undervalued compared to peers in semiconductor sector",
      target: 185,
      stopLoss: 155,
      timeframe: "2-3 weeks",
      data: generateSampleData(170, 1.5),
    },
    {
      symbol: "TSM",
      name: "Taiwan Semiconductor",
      confidence: 84,
      reasoning: "Recovering demand and expanding capacity",
      target: 150,
      stopLoss: 125,
      timeframe: "3-4 weeks",
      data: generateSampleData(135, 1.1),
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      confidence: 79,
      reasoning: "Cloud growth accelerating with AI integration",
      target: 420,
      stopLoss: 380,
      timeframe: "1-2 weeks",
      data: generateSampleData(400, 0.7),
    },
  ];
};

// Initial stocks with unique data
const initialStocks = [
  { symbol: "AAPL", name: "Apple Inc.", data: generateSampleData(150, 0.7) },
  { symbol: "TSLA", name: "Tesla Inc.", data: generateSampleData(200, 1.2) },
  { symbol: "MSFT", name: "Microsoft", data: generateSampleData(300, 0.5) },
  { symbol: "NVDA", name: "NVIDIA Corp", data: generateSampleData(450, 1.5) },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc",
    data: generateSampleData(130, 0.9),
  },
];

const AlgoTrading = () => {
  const [stocks, setStocks] = useState(initialStocks);
  const [aiSuggestedStocks, setAISuggestedStocks] = useState(
    generateAISuggestions()
  );
  
  const navigate=useNavigate();
  const [mainObserver, setMainObserver] = useState("AAPL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("chart");
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("emaCrossover");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hftParams, setHftParams] = useState({
    latency: 5,
    orderSize: 100,
    maxPositions: 10,
    maxDrawdown: 0.5,
    profitTarget: 0.1,
    stopLoss: 0.05,
    maxOrdersPerMinute: 20,
    cooldownPeriod: 5,
  });
  const [autoTrading, setAutoTrading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    winRate: 72.4,
    avgGain: 0.12,
    avgLoss: 0.07,
    profitFactor: 1.8,
    sharpeRatio: 1.4,
    totalTrades: 1247,
    dailyProfit: 324.56,
  });
  const [chartType, setChartType] = useState("line");
  const [timeframe, setTimeframe] = useState("5min");
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: true,
    bollinger: false,
    volume: false,
    macd: false,
  });
  const searchRef = useRef(null);

  // Popular stocks for suggestions
  const popularStocks = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "NVDA",
    "META",
    "JPM",
    "V",
    "JNJ",
  ];

  // Strategy parameters
  const [strategyParams, setStrategyParams] = useState({
    emaCrossover: { fast: 9, slow: 21 },
    macdStrategy: { fast: 12, slow: 26, signal: 9 },
    rsiStrategy: { period: 14, oversold: 30, overbought: 70 },
    bollingerBands: { period: 20, deviation: 2 },
    stochastic: { kPeriod: 14, dPeriod: 3, overbought: 80, oversold: 20 },
  });

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("algoRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem(
        "algoRecentSearches",
        JSON.stringify(recentSearches)
      );
    }
  }, [recentSearches]);

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handle click outside search modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate live price updates
  useEffect(() => {
    if (autoTrading) {
      const interval = setInterval(() => {
        setStocks((prevStocks) => {
          return prevStocks.map((stock) => {
            const lastPrice = stock.data[stock.data.length - 1].price;
            const change = (Math.random() - 0.5) * (lastPrice * 0.001);
            const newPrice = lastPrice + change;

            const newData = [
              ...stock.data.slice(1),
              {
                ...stock.data[stock.data.length - 1],
                price: parseFloat(newPrice.toFixed(2)),
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ];

            return {
              ...stock,
              data: newData,
            };
          });
        });
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoTrading]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `https://ai-script-writter-website.onrender.com/service/stocksearch?name=${search.toUpperCase()}`
      );
      setSearchResults([...res.data]);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to client-side filtering if API fails
      const filtered = popularStocks.filter((stock) =>
        stock.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const addStock = () => {
    const trimmedSearch = search.trim();
    if (
      trimmedSearch &&
      !stocks.find((s) => s.symbol === trimmedSearch.toUpperCase())
    ) {
      const newStock = {
        symbol: trimmedSearch.toUpperCase(),
        name: trimmedSearch,
        data: generateSampleData(Math.random() * 500 + 50, 0.5 + Math.random()),
      };
      setStocks([...stocks, newStock]);

      // Add to recent searches
      const updatedRecentSearches = [
        trimmedSearch.toUpperCase(),
        ...recentSearches.filter(
          (item) => item !== trimmedSearch.toUpperCase()
        ),
      ].slice(0, 5);

      setRecentSearches(updatedRecentSearches);
      setSearch("");
      setShowSearchModal(false);
    }
  };

  const handleStockSelect = (stockSymbol) => {
    setSearch(stockSymbol);
    setShowSearchModal(false);

    // Add to recent searches
    const updatedRecentSearches = [
      stockSymbol,
      ...recentSearches.filter((item) => item !== stockSymbol),
    ].slice(0, 5);

    setRecentSearches(updatedRecentSearches);

    // If the stock is not already in the watchlist, add it
    if (!stocks.find((s) => s.symbol === stockSymbol)) {
      const newStock = {
        symbol: stockSymbol,
        name: stockSymbol,
        data: generateSampleData(Math.random() * 500 + 50, 0.5 + Math.random()),
      };
      setStocks([...stocks, newStock]);
    }

    // Set as main observer
    setMainObserver(stockSymbol);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("algoRecentSearches");
  };

  const executeOrder = (symbol, type) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return;

    const currentPrice = getCurrentPrice(stock.data);
    const sl =
      stopLoss ||
      (type === "BUY"
        ? (currentPrice * 0.95).toFixed(2)
        : (currentPrice * 1.05).toFixed(2));
    const tg =
      target ||
      (type === "BUY"
        ? (currentPrice * 1.1).toFixed(2)
        : (currentPrice * 0.9).toFixed(2));

    const newOrder = {
      id: Date.now(),
      symbol,
      type,
      quantity: orderQuantity,
      price: currentPrice,
      stopLoss: parseFloat(sl),
      target: parseFloat(tg),
      timestamp: new Date().toLocaleTimeString(),
      status: "Executed",
      pl: 0,
    };

    setOrders([...orders, newOrder]);

    // Show confirmation message
    alert(
      `${type} order for ${orderQuantity} ${symbol} shares executed at $${currentPrice}`
    );
  };

  const getCurrentPrice = (stockData) => {
    return stockData[stockData.length - 1]?.price || 0;
  };

  const getPriceChange = (stockData) => {
    if (stockData.length < 2) return 0;
    const current = stockData[stockData.length - 1].price;
    const previous = stockData[stockData.length - 2].price;
    return ((current - previous) / previous) * 100;
  };

  const handleHftParamChange = (param, value) => {
    setHftParams({
      ...hftParams,
      [param]: parseFloat(value),
    });
  };

  const toggleIndicator = (indicator) => {
    setIndicators({
      ...indicators,
      [indicator]: !indicators[indicator],
    });
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Algorithmic Trading Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              autoTrading ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {autoTrading ? "LIVE" : "PAUSED"}
          </div>
          <div className="text-sm bg-gray-800 px-4 py-2 rounded-lg">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Watchlist and AI Suggestions */}
        <div className="xl:col-span-1 space-y-6">
          {/* Watchlist */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              Watchlist
            </h2>
            <div className="space-y-3">
              {stocks.map((stock) => {
                const currentPrice = getCurrentPrice(stock.data);
                const priceChange = getPriceChange(stock.data);
                const isMain = mainObserver === stock.symbol;

                return (
                  <div
                    key={stock.symbol}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isMain
                        ? "bg-blue-900 border border-blue-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setMainObserver(stock.symbol)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{stock.symbol}</h3>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">${currentPrice.toFixed(2)}</p>
                        <p
                          className={`text-sm ${
                            priceChange >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {priceChange >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(priceChange).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Suggested Stocks */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              AI Stock Suggestions
            </h2>
            <div className="space-y-4">
              {aiSuggestedStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-all"
                  onClick={() => {
                    if (!stocks.find((s) => s.symbol === stock.symbol)) {
                      setStocks([...stocks, stock]);
                    }
                    setMainObserver(stock.symbol);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{stock.symbol}</h3>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-green-400 text-sm font-semibold">
                          {stock.confidence}%
                        </span>
                        <div className="ml-2 w-12 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${stock.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {stock.timeframe}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    {stock.reasoning}
                  </p>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-green-400">
                      Target: ${stock.target}
                    </span>
                    <span className="text-red-400">
                      Stop: ${stock.stopLoss}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-green-400">
                  {performanceMetrics.winRate}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Avg Gain</p>
                <p className="text-xl font-bold text-green-400">
                  {performanceMetrics.avgGain}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Profit Factor</p>
                <p className="text-xl font-bold text-green-400">
                  {performanceMetrics.profitFactor}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-xl font-bold text-green-400">
                  {performanceMetrics.sharpeRatio}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg col-span-2">
                <p className="text-sm text-gray-400">Daily P&L</p>
                <p className="text-xl font-bold text-green-400">
                  ${performanceMetrics.dailyProfit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Search + Add Stock */}
          <div className="flex gap-3 relative" ref={searchRef}>
            <div className="relative flex-1 max-w-xl">
              <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2 space-x-2 border border-gray-700 shadow-sm">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className="flex-1 bg-transparent outline-none placeholder-gray-500 text-white"
                  type="text"
                  placeholder="Enter stock symbol (e.g. AAPL)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSearchModal(true)}
                  onKeyPress={(e) => e.key === "Enter" && addStock()}
                />
                {search && (
                  <button
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    onClick={() => {
                      setSearch("");
                      setSearchResults([]);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {showSearchModal && (
                <div className="absolute mt-1 w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 z-50">
                  {search.length === 0 && (
                    <>
                      {recentSearches.length > 0 && (
                        <div className="border-b border-gray-700">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-900 flex justify-between items-center">
                            <span>Recent Searches</span>
                            <button
                              className="text-xs text-blue-500 hover:text-blue-400"
                              onClick={clearRecentSearches}
                            >
                              Clear all
                            </button>
                          </div>
                          {recentSearches.map((item, index) => (
                            <div
                              key={`recent-${index}`}
                              className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between"
                              onClick={() => handleStockSelect(item)}
                            >
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-400">
                                    {item}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    NSE
                                  </span>
                                </div>
                                <div className="mt-1 text-gray-500 text-sm">
                                  Recent search
                                </div>
                              </div>
                              <button
                                className="text-gray-500 hover:text-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentSearches(
                                    recentSearches.filter((s) => s !== item)
                                  );
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-b border-gray-700">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-900">
                          Popular Stocks
                        </div>
                        {popularStocks.map((item, index) => (
                          <div
                            key={`popular-${index}`}
                            className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => handleStockSelect(item)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-400">
                                {item}
                              </span>
                              <span className="text-gray-500 text-sm">NSE</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {search.length > 0 && searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((item, index) => (
                        <div
                          key={index}
                          className="px-6 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
                          onClick={() => handleStockSelect(item)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-blue-400">
                              {item}
                            </span>
                            <span className="text-gray-500 text-sm">NSE</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {search.length > 0 && searchResults.length === 0 && (
                    <div className="px-6 py-4 text-center text-gray-500">
                      No stocks found for "{search}"
                    </div>
                  )}

                  <div className="px-4 py-2 text-xs text-gray-500 bg-gray-900 border-t border-gray-700">
                    Search for stocks by symbol or company name
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={addStock}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center"
            >
              <span>Add Stock</span>
            </button>
          </div>

          {/* Main Chart and Trading Panel */}
          <div className="bg-gray-800 rounded-2xl p-5">
            {stocks.map((stock) => {
              if (mainObserver !== stock.symbol) return null;
              const currentPrice = getCurrentPrice(stock.data);

              return (
                <div key={stock.symbol}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {stock.name} ({stock.symbol})
                      </h2>
                      <p className="text-3xl font-mono mt-1">
                        ${currentPrice}
                        <span
                          className={`text-lg ml-2 ${
                            getPriceChange(stock.data) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {getPriceChange(stock.data) >= 0 ? "↑" : "↓"}{" "}
                          {Math.abs(getPriceChange(stock.data)).toFixed(2)}%
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
                        {["5min", "15min", "1H", "4H", "1D"].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded-md text-xs ${
                              timeframe === tf
                                ? "bg-blue-600"
                                : "hover:bg-gray-600"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>

                      <div className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
                        {["chart", "trade", "strategies", "hft"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md capitalize ${
                              activeTab === tab
                                ? "bg-blue-600"
                                : "hover:bg-gray-600"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeTab === "chart" && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                          <button
                            className={`px-3 py-1 rounded-md text-xs ${
                              chartType === "line"
                                ? "bg-blue-600"
                                : "bg-gray-700"
                            }`}
                            onClick={() => setChartType("line")}
                          >
                            Line
                          </button>
                          <button
                            className={`px-3 py-1 rounded-md text-xs ${
                              chartType === "candle"
                                ? "bg-blue-600"
                                : "bg-gray-700"
                            }`}
                            onClick={() => navigate("/AlgoTrade/candlestick")}
                          >
                            Candlestick
                          </button>
                          <button
                            className={`px-3 py-1 rounded-md text-xs ${
                              chartType === "area"
                                ? "bg-blue-600"
                                : "bg-gray-700"
                            }`}
                            onClick={() => setChartType("area")}
                          >
                            Area
                          </button>
                        </div>

                        <div className="flex space-x-2">
                          {Object.entries(indicators).map(
                            ([indicator, active]) => (
                              <button
                                key={indicator}
                                className={`px-3 py-1 rounded-md text-xs ${
                                  active ? "bg-blue-600" : "bg-gray-700"
                                }`}
                                onClick={() => toggleIndicator(indicator)}
                              >
                                {indicator.toUpperCase()}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={stock.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="time" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#2D3748",
                              border: "1px solid #4A5568",
                              borderRadius: "4px",
                            }}
                            labelStyle={{ color: "#FFF" }}
                          />
                          <Legend />

                          {/* Chart Type Switch */}
                          {chartType === "line" && (
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 6 }}
                            />
                          )}

                          {chartType === "area" && (
                            <Area
                              type="monotone"
                              dataKey="price"
                              stroke="#10b981"
                              fill="url(#colorPrice)"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                            />
                          )}

                          {/* EMA Indicators */}
                          {indicators.ema && (
                            <>
                              <Line
                                type="monotone"
                                dataKey="ema12"
                                stroke="#8884d8"
                                strokeWidth={1}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="ema26"
                                stroke="#82ca9d"
                                strokeWidth={1}
                                dot={false}
                              />
                            </>
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === "trade" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-700 p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">
                          Order Placement
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={orderQuantity}
                              onChange={(e) =>
                                setOrderQuantity(parseInt(e.target.value) || 0)
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Current Price
                            </label>
                            <div className="border border-gray-600 bg-gray-800 rounded-md px-3 py-2 w-full font-mono">
                              ${currentPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Stop Loss
                            </label>
                            <input
                              type="number"
                              value={stopLoss}
                              onChange={(e) => setStopLoss(e.target.value)}
                              placeholder={`${(currentPrice * 0.95).toFixed(
                                2
                              )}`}
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Target Price
                            </label>
                            <input
                              type="number"
                              value={target}
                              onChange={(e) => setTarget(e.target.value)}
                              placeholder={`${(currentPrice * 1.05).toFixed(
                                2
                              )}`}
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => executeOrder(stock.symbol, "BUY")}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => executeOrder(stock.symbol, "SELL")}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                          >
                            Sell
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-5 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">
                          Order History
                        </h3>
                        <div className="overflow-y-auto max-h-64">
                          {orders.filter((o) => o.symbol === stock.symbol)
                            .length > 0 ? (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-300 border-b border-gray-600">
                                  <th className="pb-2">Time</th>
                                  <th className="pb-2">Type</th>
                                  <th className="pb-2">Qty</th>
                                  <th className="pb-2">Price</th>
                                  <th className="pb-2">P&L</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orders
                                  .filter((o) => o.symbol === stock.symbol)
                                  .slice()
                                  .reverse()
                                  .map((order) => {
                                    const currentPx = getCurrentPrice(
                                      stock.data
                                    );
                                    const pl =
                                      order.type === "BUY"
                                        ? (currentPx - order.price) *
                                          order.quantity
                                        : (order.price - currentPx) *
                                          order.quantity;

                                    return (
                                      <tr
                                        key={order.id}
                                        className="border-b border-gray-700"
                                      >
                                        <td className="py-2">
                                          {order.timestamp}
                                        </td>
                                        <td
                                          className={`py-2 font-medium ${
                                            order.type === "BUY"
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {order.type}
                                        </td>
                                        <td className="py-2">
                                          {order.quantity}
                                        </td>
                                        <td className="py-2">
                                          ${order.price.toFixed(2)}
                                        </td>
                                        <td
                                          className={`py-2 ${
                                            pl >= 0
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {pl >= 0 ? "+" : ""}
                                          {pl.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-gray-400 text-center py-4">
                              No orders yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "strategies" && (
                    <div className="bg-gray-700 p-5 rounded-xl mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Trading Strategies
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Select Strategy
                          </label>
                          <select
                            value={selectedStrategy}
                            onChange={(e) =>
                              setSelectedStrategy(e.target.value)
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value="emaCrossover">EMA Crossover</option>
                            <option value="macdStrategy">MACD</option>
                            <option value="rsiStrategy">RSI Reversals</option>
                            <option value="bollingerBands">
                              Bollinger Bands
                            </option>
                            <option value="stochastic">
                              Stochastic Oscillator
                            </option>
                            <option value="arbitrage">Arbitrage</option>
                            <option value="meanReversion">
                              Mean Reversion
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Timeframe
                          </label>
                          <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          >
                            <option value="1min">1 Minute</option>
                            <option value="5min">5 Minutes</option>
                            <option value="15min">15 Minutes</option>
                            <option value="1H">1 Hour</option>
                            <option value="4H">4 Hours</option>
                            <option value="1D">1 Day</option>
                          </select>
                        </div>
                      </div>

                      {selectedStrategy === "emaCrossover" && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Fast EMA Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.emaCrossover.fast}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  emaCrossover: {
                                    ...strategyParams.emaCrossover,
                                    fast: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Slow EMA Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.emaCrossover.slow}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  emaCrossover: {
                                    ...strategyParams.emaCrossover,
                                    slow: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                      )}

                      {selectedStrategy === "macdStrategy" && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Fast Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.macdStrategy.fast}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  macdStrategy: {
                                    ...strategyParams.macdStrategy,
                                    fast: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Slow Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.macdStrategy.slow}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  macdStrategy: {
                                    ...strategyParams.macdStrategy,
                                    slow: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Signal Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.macdStrategy.signal}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  macdStrategy: {
                                    ...strategyParams.macdStrategy,
                                    signal: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                      )}

                      {selectedStrategy === "rsiStrategy" && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              RSI Period
                            </label>
                            <input
                              type="number"
                              value={strategyParams.rsiStrategy.period}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  rsiStrategy: {
                                    ...strategyParams.rsiStrategy,
                                    period: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Oversold Level
                            </label>
                            <input
                              type="number"
                              value={strategyParams.rsiStrategy.oversold}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  rsiStrategy: {
                                    ...strategyParams.rsiStrategy,
                                    oversold: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              Overbought Level
                            </label>
                            <input
                              type="number"
                              value={strategyParams.rsiStrategy.overbought}
                              onChange={(e) =>
                                setStrategyParams({
                                  ...strategyParams,
                                  rsiStrategy: {
                                    ...strategyParams.rsiStrategy,
                                    overbought: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition mr-3">
                          Backtest Strategy
                        </button>
                        <button
                          className={`px-5 py-2 rounded-lg transition font-semibold ${
                            autoTrading
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white`}
                          onClick={() => setAutoTrading(!autoTrading)}
                        >
                          {autoTrading
                            ? "Stop Auto-Trading"
                            : "Activate Auto-Trading"}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "hft" && (
                    <div className="bg-gray-700 p-5 rounded-xl mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        High-Frequency Trading Settings
                      </h3>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Max Latency (ms)
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={hftParams.latency}
                            onChange={(e) =>
                              handleHftParamChange("latency", e.target.value)
                            }
                            className="w-full"
                          />
                          <div className="text-right text-xs text-gray-400">
                            {hftParams.latency} ms
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Order Size (shares)
                          </label>
                          <input
                            type="number"
                            value={hftParams.orderSize}
                            onChange={(e) =>
                              handleHftParamChange("orderSize", e.target.value)
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Max Positions
                          </label>
                          <input
                            type="number"
                            value={hftParams.maxPositions}
                            onChange={(e) =>
                              handleHftParamChange(
                                "maxPositions",
                                e.target.value
                              )
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Max Drawdown (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={hftParams.maxDrawdown}
                            onChange={(e) =>
                              handleHftParamChange(
                                "maxDrawdown",
                                e.target.value
                              )
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Profit Target (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={hftParams.profitTarget}
                            onChange={(e) =>
                              handleHftParamChange(
                                "profitTarget",
                                e.target.value
                              )
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Stop Loss (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={hftParams.stopLoss}
                            onChange={(e) =>
                              handleHftParamChange("stopLoss", e.target.value)
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Max Orders/Min
                          </label>
                          <input
                            type="number"
                            value={hftParams.maxOrdersPerMinute}
                            onChange={(e) =>
                              handleHftParamChange(
                                "maxOrdersPerMinute",
                                e.target.value
                              )
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Cooldown (sec)
                          </label>
                          <input
                            type="number"
                            value={hftParams.cooldownPeriod}
                            onChange={(e) =>
                              handleHftParamChange(
                                "cooldownPeriod",
                                e.target.value
                              )
                            }
                            className="border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 w-full"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition mr-3">
                          Optimize Parameters
                        </button>
                        <button
                          className={`px-5 py-2 rounded-lg transition font-semibold ${
                            autoTrading
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white`}
                          onClick={() => setAutoTrading(!autoTrading)}
                        >
                          {autoTrading ? "Stop HFT" : "Start HFT"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Technical Indicators */}
                  <div className="bg-gray-700 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">
                      Technical Indicators
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">RSI (14)</p>
                        <p
                          className={`text-xl font-mono ${
                            stock.data[stock.data.length - 1].rsi > 70
                              ? "text-red-400"
                              : stock.data[stock.data.length - 1].rsi < 30
                              ? "text-green-400"
                              : "text-white"
                          }`}
                        >
                          {stock.data[stock.data.length - 1].rsi.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">MACD</p>
                        <p
                          className={`text-xl font-mono ${
                            stock.data[stock.data.length - 1].macd >
                            stock.data[stock.data.length - 1].signal
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {stock.data[stock.data.length - 1].macd.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Signal</p>
                        <p className="text-xl font-mono">
                          {stock.data[stock.data.length - 1].signal.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Volume</p>
                        <p className="text-xl font-mono">
                          {(
                            stock.data[stock.data.length - 1].volume / 1000
                          ).toFixed(1)}
                          K
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoTrading;
