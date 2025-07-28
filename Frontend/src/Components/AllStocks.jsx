import React, { useEffect, useState } from "react";
import Navbar from "./FrontPage/Navbar";
import axios from "axios";

const AllStocks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMarketCap, setMinMarketCap] = useState("");
  const [maxMarketCap, setMaxMarketCap] = useState("");

  const itemsPerPage = 20;

  // Sample stock data with numeric values
  const allStocks = Array.from({ length: 100 }, (_, i) => ({
    symbol: `STK${i + 1}`,
    name: `Stock ${i + 1}`,
    price: Math.random() * 1000,
    change: Math.random() * 10 - 5,
    volume: Math.floor(Math.random() * 1000000),
    marketCap: Math.floor(Math.random() * 1000000000),
    exchange: ["NYSE", "NASDAQ", "NSE", "BSE"][Math.floor(Math.random() * 4)],
  }));

  const [symbols,setSymbols]=useState([]);
  const [stocks,setStocks]=useState([]);
  useEffect(()=>{
    (async ()=>{
      try{
        const res=await axios.get('https://stocktrackpro-ozwl.onrender.com/service/stockname');
        setSymbols([...res.data.columnValues])
      }catch(error){
        console.log("error in getting stockName Data, ",error);
      }
    })()
    
  },[])

  useEffect(()=>{
    (()=>{
      try{
        console.log(symbols)
        const arr=[];
        symbols.map(async(symbol,index)=>{
          arr.push(await axios.get(
            `https://stocktrackpro-ozwl.onrender.com/service/scrapweb/info?symbol=${symbol}`
          ));
        })
        arr.map((res,index)=>{
          const stockDataResponse = res.data.stockData;
          const topRatios = stockDataResponse.topRatios;
          const financials = stockDataResponse.financials;
          const currentPriceRatio = topRatios.find(
            (ratio) => ratio.key === "Current Price"
          );
          const currentPrice = currentPriceRatio
            ? parseFloat(currentPriceRatio.value.replace(/[^0-9.]/g, ""))
            : 0;


          const marketCap = topRatios.find((r) => r.key === "Market Cap")?.value || "0"
          setStocks([...stocks,{
            symbol:symbols[index],
            name:'SAMPLE',
            price:currentPrice,
            change:'0',
            volume:'',
            marketCap:marketCap,
            exchange:'NSE'
          }])
        })
      }catch(error){
        console.log("error in fetching stocks info, ",error);
      }
    })()
  },[symbols])

  // Filtering logic
  const filteredStocks = stocks
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExchange =
        selectedExchange === "all" || stock.exchange === selectedExchange;
      const price = stock.price;
      const matchesPrice =
        (minPrice === "" || price >= parseFloat(minPrice)) &&
        (maxPrice === "" || price <= parseFloat(maxPrice));
      const marketCap = stock.marketCap;
      const matchesMarketCap =
        (minMarketCap === "" || marketCap >= parseFloat(minMarketCap) * 1e9) &&
        (maxMarketCap === "" || marketCap <= parseFloat(maxMarketCap) * 1e9);

      return (
        matchesSearch && matchesExchange && matchesPrice && matchesMarketCap
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "symbol" || sortBy === "name") {
        comparison = a[sortBy].localeCompare(b[sortBy]);
      } else {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        comparison = aVal - bVal;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search stocks..."
            className="p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="p-2 border rounded-lg"
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
          >
            <option value="all">All Exchanges</option>
            <option value="NYSE">NYSE</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>

          <select
            className="p-2 border rounded-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="symbol">Symbol</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="change">Change</option>
            <option value="volume">Volume</option>
            <option value="marketCap">Market Cap</option>
          </select>

          <select
            className="p-2 border rounded-lg"
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <div className="md:col-span-2 flex gap-4">
            <input
              type="number"
              placeholder="Min Price"
              className="p-2 border rounded-lg flex-1"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              step="0.01"
            />
            <input
              type="number"
              placeholder="Max Price"
              className="p-2 border rounded-lg flex-1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <input
              type="number"
              placeholder="Min Market Cap (B)"
              className="p-2 border rounded-lg flex-1"
              value={minMarketCap}
              onChange={(e) => setMinMarketCap(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Market Cap (B)"
              className="p-2 border rounded-lg flex-1"
              value={maxMarketCap}
              onChange={(e) => setMaxMarketCap(e.target.value)}
            />
          </div>
        </div>

        {/* Stocks Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Volume
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Exchange
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStocks.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right ${
                      stock.change >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stock.change >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(stock.change).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {stock.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    ${(stock.marketCap / 1e9).toFixed(1)}B
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {stock.exchange}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of{" "}
                {Math.ceil(filteredStocks.length / itemsPerPage)}
              </span>

              <button
                className="px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(filteredStocks.length / itemsPerPage)
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} StockTrack Pro. All rights reserved.
            <br />
            Market data delayed by 15 minutes. Real-time data available with
            premium subscription.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllStocks;
