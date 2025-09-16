import Stock from "../Models/Stocks.models.js";
import axios from "axios";
import User from "../Models/user.models.js";
// Get all stock symbols
export const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}, "symbol");
    const symbols = stocks.map((stock) => stock.symbol);

    res.json({
      success: true,
      columnValues: symbols,
      count: symbols.length,
    });
  } catch (error) {
    console.error("Error fetching stock symbols:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock symbols",
    });
  }
};

// Get filtered stocks with pagination
export const getFilteredStocks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "symbol",
      sortDirection = "asc",
      searchTerm,
      exchange,
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
    } = req.query;

    // Build filter object
    const filter = {};

    if (searchTerm) {
      filter.$or = [
        { symbol: { $regex: searchTerm, $options: "i" } },
        { companyName: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (exchange && exchange !== "all") {
      filter.exchange = exchange;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minMarketCap || maxMarketCap) {
      filter.marketCap = {};
      if (minMarketCap) filter.marketCap.$gte = parseFloat(minMarketCap) * 1e9;
      if (maxMarketCap) filter.marketCap.$lte = parseFloat(maxMarketCap) * 1e9;
    }

    if (sector && sector !== "all") {
      filter.sector = sector;
    }

    if (industry && industry !== "all") {
      filter.industry = industry;
    }

    if (dividendYieldMin || dividendYieldMax) {
      filter.dividendYield = {};
      if (dividendYieldMin)
        filter.dividendYield.$gte = parseFloat(dividendYieldMin);
      if (dividendYieldMax)
        filter.dividendYield.$lte = parseFloat(dividendYieldMax);
    }

    if (peRatioMin || peRatioMax) {
      filter.peRatio = {};
      if (peRatioMin) filter.peRatio.$gte = parseFloat(peRatioMin);
      if (peRatioMax) filter.peRatio.$lte = parseFloat(peRatioMax);
    }

    // For additional fields you might need to add to your schema
    if (epsMin || epsMax) {
      filter.eps = {};
      if (epsMin) filter.eps.$gte = parseFloat(epsMin);
      if (epsMax) filter.eps.$lte = parseFloat(epsMax);
    }

    if (betaMin || betaMax) {
      filter.beta = {};
      if (betaMin) filter.beta.$gte = parseFloat(betaMin);
      if (betaMax) filter.beta.$lte = parseFloat(betaMax);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortDirection === "desc" ? -1 : 1;

    // Execute query
    const stocks = await Stock.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Stock.countDocuments(filter);

    res.json({
      success: true,
      stocks,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching filtered stocks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching filtered stocks",
    });
  }
};

// Get single stock by symbol
export const getStockBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ symbol });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock",
    });
  }
};

// Update stock data
export const updateStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const updateData = req.body;

    const stock = await Stock.findOneAndUpdate(
      { symbol },
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: "Error updating stock",
    });
  }
};

// Refresh stock data (scrape and update)
export const refreshStockData = async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        message: "Symbols array is required",
      });
    }

    const results = [];

    for (const symbol of symbols) {
      try {
        // Simulate fetching data from external API
        // Replace this with your actual data fetching logic
        const mockData = {
          symbol,
          companyName: `${symbol} Company`,
          price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
          marketCap: parseFloat((Math.random() * 100 + 1).toFixed(2)) * 1e9,
          peRatio: parseFloat((Math.random() * 30 + 5).toFixed(2)),
          dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
          beta: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          volume: Math.floor(Math.random() * 10000000),
          sector: ["Technology", "Healthcare", "Financial", "Energy"][
            Math.floor(Math.random() * 4)
          ],
          industry: ["Software", "Banks", "Pharmaceuticals", "Oil & Gas"][
            Math.floor(Math.random() * 4)
          ],
          exchange: ["NSE", "BSE"][Math.floor(Math.random() * 2)],
        };

        // Update or create stock
        const updatedStock = await Stock.findOneAndUpdate(
          { symbol },
          { ...mockData, lastUpdated: new Date() },
          { new: true, upsert: true, runValidators: true }
        );

        results.push({
          symbol,
          success: true,
          stock: updatedStock,
        });
      } catch (error) {
        console.error(`Error refreshing data for ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error refreshing stock data:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing stock data",
    });
  }
};

export const EditWatchList = async (req, res) => {
  try {
    const userId = req.userPayload._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.Watchlist = req.body.watchlist;
    await user.save();

    console.log(user.Watchlist);
    res.status(200).json({ success: true, watchlist: user.Watchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating watchlist",
    });
  }
};
