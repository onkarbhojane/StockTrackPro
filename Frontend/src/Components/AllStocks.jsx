import React, { useEffect, useState } from "react";
import Navbar from "./FrontPage/Navbar";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUpAlt,
  FaChartLine,
  FaEye,
  FaPlusCircle,
  FaInfoCircle,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";

const AllStocks = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMarketCap, setMinMarketCap] = useState("");
  const [maxMarketCap, setMaxMarketCap] = useState("");
  const [sector, setSector] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [dividendYieldMin, setDividendYieldMin] = useState("");
  const [dividendYieldMax, setDividendYieldMax] = useState("");
  const [peRatioMin, setPeRatioMin] = useState("");
  const [peRatioMax, setPeRatioMax] = useState("");
  const [epsMin, setEpsMin] = useState("");
  const [epsMax, setEpsMax] = useState("");
  const [betaMin, setBetaMin] = useState("");
  const [betaMax, setBetaMax] = useState("");
  const [yearHighMin, setYearHighMin] = useState("");
  const [yearHighMax, setYearHighMax] = useState("");
  const [yearLowMin, setYearLowMin] = useState("");
  const [yearLowMax, setYearLowMax] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [fetchingPage, setFetchingPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [priceChange1dMin, setPriceChange1dMin] = useState("");
  const [priceChange1dMax, setPriceChange1dMax] = useState("");
  const [priceChange1yMin, setPriceChange1yMin] = useState("");
  const [priceChange1yMax, setPriceChange1yMax] = useState("");
  const [error, setError] = useState("");
  const [sectors, setSectors] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [refreshingStocks, setRefreshingStocks] = useState(false);
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  const itemsPerPage = 20;

  // Fetch available sectors and industries
  const fetchFilterOptions = async () => {
    try {
      const [sectorsRes, industriesRes] = await Promise.all([
        axios.get("https://stocktrackpro-2.onrender.com/service/stocks/sectors"),
        axios.get("https://stocktrackpro-2.onrender.com/service/stocks/industries"),
      ]);

      if (sectorsRes.data.success) setSectors(sectorsRes.data.sectors);
      if (industriesRes.data.success)
        setIndustries(industriesRes.data.industries);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  // Fetch stock data with applied filters
  const fetchStockData = async (page = 1, resetPage = false) => {
    if (resetPage) setCurrentPage(1);

    const pageToFetch = resetPage ? 1 : page;
    setFetchingPage(true);
    setError("");

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pageToFetch,
        limit: itemsPerPage,
        sortBy,
        sortDirection,
        ...(searchTerm && { searchTerm }),
        ...(selectedExchange !== "all" && { exchange: selectedExchange }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(minMarketCap && { minMarketCap }),
        ...(maxMarketCap && { maxMarketCap }),
        ...(sector !== "all" && { sector }),
        ...(industry !== "all" && { industry }),
        ...(dividendYieldMin && { dividendYieldMin }),
        ...(dividendYieldMax && { dividendYieldMax }),
        ...(peRatioMin && { peRatioMin }),
        ...(peRatioMax && { peRatioMax }),
        ...(epsMin && { epsMin }),
        ...(epsMax && { epsMax }),
        ...(betaMin && { betaMin }),
        ...(betaMax && { betaMax }),
        ...(yearHighMin && { yearHighMin }),
        ...(yearHighMax && { yearHighMax }),
        ...(yearLowMin && { yearLowMin }),
        ...(yearLowMax && { yearLowMax }),
        ...(priceChange1dMin && { priceChange1dMin }),
        ...(priceChange1dMax && { priceChange1dMax }),
        ...(priceChange1yMin && { priceChange1yMin }),
        ...(priceChange1yMax && { priceChange1yMax }),
      });

      const res = await axios.get(
        `https://stocktrackpro-2.onrender.com/service/stocks/filter?${params}`
      );

      if (res.data.success) {
        setStocks(res.data.stocks || []);
        setTotalCount(res.data.totalCount || 0);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(res.data.message || "Failed to fetch stocks");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Failed to connect to server. Please try again later.");
    } finally {
      setLoading(false);
      setFetchingPage(false);
    }
  };

  // Fetch single stock details
  const fetchStockDetails = async (symbol) => {
    try {
      const res = await axios.get(
        `https://stocktrackpro-2.onrender.com/service/stocks/${symbol}`
      );

      if (res.data.success) {
        setSelectedStock(res.data.stock);
        setShowStockDetails(true);
      } else {
        setError("Failed to fetch stock details");
      }
    } catch (error) {
      console.error("Error fetching stock details:", error);
      setError("Failed to fetch stock details");
    }
  };

  // Refresh stock data for selected symbols
  const refreshSelectedStocks = async () => {
    if (watchlist.length === 0) {
      setError("No stocks in watchlist to refresh");
      return;
    }

    setRefreshingStocks(true);
    setError("");

    try {
      const res = await axios.post(
        "https://stocktrackpro-2.onrender.com/service/stocks/refresh",
        {
          symbols: watchlist,
        }
      );

      if (res.data.success) {
        // Refetch the current page to update data
        fetchStockData(currentPage);
        setError(`Successfully refreshed ${watchlist.length} stocks`);
      } else {
        setError("Failed to refresh stock data");
      }
    } catch (error) {
      console.error("Error refreshing stocks:", error);
      setError("Failed to refresh stock data");
    } finally {
      setRefreshingStocks(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStockData(1);
    fetchFilterOptions();

    // Load watchlist from localStorage if available
    const savedWatchlist = localStorage.getItem("stockWatchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, [sortBy, sortDirection]);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("stockWatchlist", JSON.stringify(watchlist));
    storeWatchList();
  }, [watchlist]);
  const storeWatchList = async () => {
    try {
      const resp = await axios.patch(
        "https://stocktrackpro-2.onrender.com/service/stocks/watchlist",
        { watchlist }, // watchlist is an array
        {
          headers: {
            Authorization: `Bearer ${cookieToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Watchlist edited successfully:", resp.data);
    } catch (error) {
      console.log("Error in saving watchlist:", error);
    }
  };

  // Handle filter changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStockData(1, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    selectedExchange,
    minPrice,
    maxPrice,
    minMarketCap,
    maxMarketCap,
    sector,
    industry,
    dividendYieldMin,
    dividendYieldMax,
    peRatioMin,
    peRatioMax,
    epsMin,
    epsMax,
    betaMin,
    betaMax,
    yearHighMin,
    yearHighMax,
    yearLowMin,
    yearLowMax,
    priceChange1dMin,
    priceChange1dMax,
    priceChange1yMin,
    priceChange1yMax,
  ]);

  // Handle page change
  useEffect(() => {
    if (currentPage > 1) {
      fetchStockData(currentPage);
    }
  }, [currentPage]);

  const toggleWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((item) => item !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedExchange("all");
    setMinPrice("");
    setMaxPrice("");
    setMinMarketCap("");
    setMaxMarketCap("");
    setSector("all");
    setIndustry("all");
    setDividendYieldMin("");
    setDividendYieldMax("");
    setPeRatioMin("");
    setPeRatioMax("");
    setEpsMin("");
    setEpsMax("");
    setBetaMin("");
    setBetaMax("");
    setYearHighMin("");
    setYearHighMax("");
    setYearLowMin("");
    setYearLowMax("");
    setPriceChange1dMin("");
    setPriceChange1dMax("");
    setPriceChange1yMin("");
    setPriceChange1yMax("");
  };

  const refreshData = () => {
    fetchStockData(currentPage);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stock Screener
            </h1>
            <p className="text-gray-600">
              Discover and analyze stocks with advanced filtering
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshSelectedStocks}
              disabled={refreshingStocks || watchlist.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshingStocks ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSync />
              )}
              Refresh Watchlist
            </button>

            <div className="text-sm text-gray-600 flex items-center">
              <span>Last updated: {lastUpdated}</span>
              <button
                onClick={refreshData}
                className="ml-2 p-1 text-gray-500 hover:text-blue-600"
                disabled={fetchingPage}
              >
                <FaSync className={fetchingPage ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        {/* Search and Basic Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search stocks..."
                className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
            >
              <option value="all">All Exchanges</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="symbol">Symbol</option>
              <option value="companyName">Name</option>
              <option value="price">Price</option>
              <option value="change">Change %</option>
              <option value="volume">Volume</option>
              <option value="marketCap">Market Cap</option>
              <option value="peRatio">P/E Ratio</option>
              <option value="dividendYield">Dividend Yield</option>
              <option value="eps">EPS</option>
              <option value="beta">Beta</option>
            </select>

            <button
              className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? (
                <FaSortAmountDown />
              ) : (
                <FaSortAmountUpAlt />
              )}
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FaFilter />
              {showAdvancedFilters
                ? "Hide Advanced Filters"
                : "Show Advanced Filters"}
            </button>

            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={resetFilters}
            >
              Reset All Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Market Cap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Market Cap (B ₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={minMarketCap}
                      onChange={(e) => setMinMarketCap(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={maxMarketCap}
                      onChange={(e) => setMaxMarketCap(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector
                  </label>
                  <select
                    className="p-2 w-full border border-gray-300 rounded-lg"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  >
                    <option value="all">All Sectors</option>
                    {sectors.map((sec, idx) => (
                      <option key={idx} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    className="p-2 w-full border border-gray-300 rounded-lg"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="all">All Industries</option>
                    {industries.map((ind, idx) => (
                      <option key={idx} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dividend Yield */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dividend Yield (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={dividendYieldMin}
                      onChange={(e) => setDividendYieldMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={dividendYieldMax}
                      onChange={(e) => setDividendYieldMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* P/E Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    P/E Ratio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={peRatioMin}
                      onChange={(e) => setPeRatioMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={peRatioMax}
                      onChange={(e) => setPeRatioMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* EPS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EPS (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={epsMin}
                      onChange={(e) => setEpsMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={epsMax}
                      onChange={(e) => setEpsMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Beta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beta
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={betaMin}
                      onChange={(e) => setBetaMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={betaMax}
                      onChange={(e) => setBetaMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* 52-week High */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    52-Week High (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={yearHighMin}
                      onChange={(e) => setYearHighMin(e.target.value)}
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={yearHighMax}
                      onChange={(e) => setYearHighMax(e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>

                {/* 52-week Low */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    52-Week Low (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={yearLowMin}
                      onChange={(e) => setYearLowMin(e.target.value)}
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={yearLowMax}
                      onChange={(e) => setYearLowMax(e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>

                {/* 1-Day Price Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1-Day Change (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={priceChange1dMin}
                      onChange={(e) => setPriceChange1dMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={priceChange1dMax}
                      onChange={(e) => setPriceChange1dMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* 1-Year Price Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1-Year Change (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={priceChange1yMin}
                      onChange={(e) => setPriceChange1yMin(e.target.value)}
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="p-2 w-full border border-gray-300 rounded-lg"
                      value={priceChange1yMax}
                      onChange={(e) => setPriceChange1yMax(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {stocks.length} of {totalCount} stocks
            {watchlist.length > 0 && ` | ${watchlist.length} in watchlist`}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaInfoCircle />
            <span>Click on any stock to view detailed analysis</span>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Watchlist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  {/* <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th> */}
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P/E Ratio
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Div Yield
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fetchingPage ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <FaSpinner className="animate-spin text-blue-500 mr-2" />
                        <span>Loading stocks...</span>
                      </div>
                    </td>
                  </tr>
                ) : stocks.length > 0 ? (
                  stocks.map((stock, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleWatchlist(stock._id)}
                          className={`p-1 rounded-full ${
                            watchlist.includes(stock._id)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          <FaPlusCircle />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {stock.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{stock.price?.toFixed(2) || "N/A"}
                      </td>
                      {/* <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {stock.change !== undefined ? `${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%` : 'N/A'}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {stock.volume ? stock.volume.toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {stock.marketCap >= 1e12
                          ? `₹${(stock.marketCap / 1e12).toFixed(2)}T`
                          : stock.marketCap >= 1e9
                          ? `₹${(stock.marketCap / 1e9).toFixed(2)}B`
                          : stock.marketCap >= 1e6
                          ? `₹${(stock.marketCap / 1e6).toFixed(2)}M`
                          : stock.marketCap
                          ? `₹${stock.marketCap.toLocaleString()}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.exchange || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {stock.peRatio || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {stock.dividendYield
                          ? `${stock.dividendYield}%`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => fetchStockDetails(stock.symbol)}
                          >
                            <FaEye />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FaChartLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-6 py-8 text-center">
                      <p className="text-gray-500">
                        No stocks match your filters. Try adjusting your
                        criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!fetchingPage && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || fetchingPage}
                  >
                    First
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || fetchingPage}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        className={`px-3 py-1.5 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        } ${
                          fetchingPage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => !fetchingPage && setCurrentPage(pageNum)}
                        disabled={fetchingPage}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || fetchingPage}
                  >
                    Next
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || fetchingPage}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Details Modal */}
      {showStockDetails && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedStock.companyName} ({selectedStock.symbol})
                </h2>
                <button
                  onClick={() => setShowStockDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        ₹{selectedStock.price?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap:</span>
                      <span className="font-medium">
                        {selectedStock.marketCap >= 1e12
                          ? `₹${(selectedStock.marketCap / 1e12).toFixed(2)}T`
                          : selectedStock.marketCap >= 1e9
                          ? `₹${(selectedStock.marketCap / 1e9).toFixed(2)}B`
                          : selectedStock.marketCap >= 1e6
                          ? `₹${(selectedStock.marketCap / 1e6).toFixed(2)}M`
                          : selectedStock.marketCap
                          ? `₹${selectedStock.marketCap.toLocaleString()}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P/E Ratio:</span>
                      <span className="font-medium">
                        {selectedStock.peRatio || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dividend Yield:</span>
                      <span className="font-medium">
                        {selectedStock.dividendYield
                          ? `${selectedStock.dividendYield}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume:</span>
                      <span className="font-medium">
                        {selectedStock.volume
                          ? selectedStock.volume.toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Company Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange:</span>
                      <span className="font-medium">
                        {selectedStock.exchange || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector:</span>
                      <span className="font-medium">
                        {selectedStock.sector || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">
                        {selectedStock.industry || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beta:</span>
                      <span className="font-medium">
                        {selectedStock.beta || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EPS:</span>
                      <span className="font-medium">
                        {selectedStock.eps || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => toggleWatchlist(selectedStock.symbol)}
                  className={`px-4 py-2 rounded-lg ${
                    watchlist.includes(selectedStock.symbol)
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {watchlist.includes(selectedStock.symbol)
                    ? "Remove from Watchlist"
                    : "Add to Watchlist"}
                </button>
                <button
                  onClick={() => {
                    // Implement chart view functionality
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Charts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">StockTrack Pro</h3>
              <p className="text-sm text-gray-400 mt-1">
                Advanced stock screening and analysis tools
              </p>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>
                © {new Date().getFullYear()} StockTrack Pro. All rights
                reserved.
              </p>
              <p className="mt-1">
                Market data is for informational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllStocks;
