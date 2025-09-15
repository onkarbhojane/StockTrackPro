import MarketData from "../Models/MarketData.models.js";
import DailyData from "../Models/DailyData.models.js";

const LiveData = async (req, res) => {
  try {
    const { symbol, type } = req.query;

    if (!symbol || !type) {
      return res.status(400).json({ error: "symbol and type are required" });
    }

    if (type === "Daily") {
      // ⏳ Aggregate tick data -> 1 minute candles
      const data = await MarketData.aggregate([
        { $match: { Symbol: symbol } },

        // round Date to nearest minute (truncate seconds + ms)
        {
          $group: {
            _id: {
              Symbol: "$Symbol",
              minute: {
                $dateTrunc: {
                  date: "$Date",
                  unit: "minute"
                }
              }
            },
            Open: { $first: "$Open" },
            High: { $max: "$High" },
            Low: { $min: "$Low" },
            Close: { $last: "$Close" },
            Volume: { $avg: "$Volume" } // average volume in that minute
          }
        },

        { $sort: { "_id.minute": 1 } }, // ascending by time

        {
          $project: {
            _id: 0,
            Symbol: "$_id.Symbol",
            Date: "$_id.minute",
            Open: 1,
            High: 1,
            Low: 1,
            Close: 1,
            Volume: 1
          }
        }
      ]);

      return res.json(data);

    } else if (type === "Weekly") {
      const data = await DailyData.find({ Symbol: symbol })
        .sort({ Date: -1 })
        .limit(7)
        .select("Open High Low Close Volume Date");

      return res.json(data.reverse());

    } else if (type === "Yearly") {
      const data = await DailyData.find({ Symbol: symbol })
        .sort({ Date: -1 })
        .limit(252)
        .select("Open High Low Close Volume Date");

      return res.json(data.reverse());
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error("❌ Error fetching aggregated 1-minute data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
};

export default LiveData;
