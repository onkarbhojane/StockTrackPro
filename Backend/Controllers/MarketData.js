import axios from "axios";
import DailyData from "../Models/DailyData.models.js";

const MarketData = async (req, res) => {
  try {
    
    const headers = {
      "User-Agent": "Mozilla/5.0",
      Accept: "*/*",
      Referer: "https://www.nseindia.com",
      Origin: "https://www.nseindia.com",
    };

    const [gainersRes, losersRes] = await Promise.all([
      axios.get(
        "https://www.nseindia.com/api/live-analysis-variations?index=gainers",
        { headers }
      ),
      axios.get(
        "https://www.nseindia.com/api/live-analysis-variations?index=loosers",
        { headers }
      ),
    ]);

    const saveData = async (name, rawData) => {
      const simplifiedData = rawData?.map((stock) => ({
        Symbol: stock.symbol,
        Price: stock.ltp,
        ProfitLoss: stock.perChange,
      }));

      const entry = new DailyData({ Name: name, data: simplifiedData });
      await entry.save();
    };

    await saveData("gainers", gainersRes.data.NIFTY?.data || []);
    await saveData("losers", losersRes.data.NIFTY?.data || []);

    res.status(200).json({
      message: "Market data fetched and stored successfully",
      gainers: gainersRes.data.NIFTY?.data || [],
      losers: losersRes.data.NIFTY?.data || [],
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};

export default MarketData;
