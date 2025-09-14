import mongoose from "mongoose";

const MarketDataSchema = new mongoose.Schema({
  Symbol: { type: String, required: true },
  Date: { type: Date, required: true },
  Open: Number,
  High: Number,
  Low: Number,
  Close: Number,
  Volume: Number,
});
const MarketData = mongoose.model("MarketData", MarketDataSchema);
export default MarketData;