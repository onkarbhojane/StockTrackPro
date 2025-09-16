import User from "../Models/user.models.js";
import Stock from "../Models/Stocks.models.js";

const getWatchList = async (req, res) => {
    try {
      const userId = req.userPayload._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const watchlist = await Stock.find({ _id: { $in: user.Watchlist } });
      res.json({ success: true, watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ success: false, message: "Error fetching watchlist" });
    }
  };
  
  export default getWatchList;