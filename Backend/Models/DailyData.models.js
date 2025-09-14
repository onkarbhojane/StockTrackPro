import mongoose from "mongoose";
const DailyDataSchema = new mongoose.Schema({
  Symbol: { type: String, required: true },
  Date: { type: Date, required: true },
  Open: Number,
  High: Number,
  Low: Number,
  Close: Number,
  Volume: Number,
});
const DailyData = mongoose.model("DailyData", DailyDataSchema);
export default DailyData;