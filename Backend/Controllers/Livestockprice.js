import MarketData from "../Models/MarketData.models.js";
import DailyData from "../Models/DailyData.models.js";


const LiveData = async (req, res) => {
  try {
    const { symbol, type } = req.query;

    if (!symbol || !type) {
      return res.status(400).json({ error: "symbol and type are required" });
    }

    if (type === "Daily") {
      // Last tick of the day
      const data = await MarketData.aggregate([
        { $match: { Symbol: symbol } },
        {
          $group: {
            _id: "$Symbol",
            Open: { $first: "$Open" }, // first open
            High: { $max: "$High" },   // highest of the day
            Low: { $min: "$Low" },     // lowest of the day
            Close: { $last: "$Close" },// last close
            Volume: { $sum: "$Volume" },
          },
        },
      ]);
      return res.json(data[0] || {});

    } else if (type === "Weekly") {
      // Aggregate last 7 days
      const data = await DailyData.aggregate([
        { $match: { Symbol: symbol } },
        { $sort: { Date: -1 } },
        { $limit: 7 },
        {
          $group: {
            _id: "$Symbol",
            Open: { $first: "$Open" },
            High: { $max: "$High" },
            Low: { $min: "$Low" },
            Close: { $last: "$Close" },
            Volume: { $sum: "$Volume" },
          },
        },
      ]);
      return res.json(data[0] || {});

    } else if (type === "Yearly") {
      // Aggregate last 252 trading days ~ 1 year
      const data = await DailyData.aggregate([
        { $match: { Symbol: symbol } },
        { $sort: { Date: -1 } },
        { $limit: 252 },
        {
          $group: {
            _id: "$Symbol",
            Open: { $first: "$Open" },
            High: { $max: "$High" },
            Low: { $min: "$Low" },
            Close: { $last: "$Close" },
            Volume: { $sum: "$Volume" },
          },
        },
      ]);
      return res.json(data[0] || {});
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error("❌ Error fetching aggregated data:", error);
    res.status(500).json({ error: "Failed to fetch aggregated data" });
  }
};

export default LiveData;
