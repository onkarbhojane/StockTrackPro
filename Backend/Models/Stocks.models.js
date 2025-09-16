import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  sector: { type: String },
  industry: { type: String },
  marketCap: { type: Number },
  peRatio: { type: Number },
  dividendYield: { type: Number },
  beta: { type: Number },
  volume: { type: Number },
  price: { type: Number },
  exchange: { type: String, default: "NSE" },
  eps: { type: Number }, // Earnings Per Share
  yearHigh: { type: Number }, // 52-week high
  yearLow: { type: Number }, // 52-week low
  priceChange1d: { type: Number }, // 1-day price change percentage
  priceChange1y: { type: Number }, // 1-year price change percentage
  lastUpdated: { type: Date, default: Date.now }
});

// Index for better query performance
stockSchema.index({ symbol: 1 });
stockSchema.index({ sector: 1 });
stockSchema.index({ industry: 1 });
stockSchema.index({ exchange: 1 });
stockSchema.index({ price: 1 });
stockSchema.index({ marketCap: 1 });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;