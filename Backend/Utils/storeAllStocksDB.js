import mongoose from "mongoose";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import Stock from "../Models/Stocks.models.js"; // ✅ correct path

/* ---------------------- MongoDB Connection ---------------------- */
const MONGO_URI =
  "mongodb+srv://onkarbhojane22:Onkar%401234@cluster0.rdojecr.mongodb.net/Stock?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ---------------------- Excel File Path ---------------------- */
const filePath = path.resolve("./Utils/stockNames.xlsx");

if (!fs.existsSync(filePath)) {
  console.error(`❌ Excel file not found at: ${filePath}`);
  process.exit(1);
}

/* ---------------------- Read Excel ---------------------- */
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

/* ---------------------- Helpers ---------------------- */
const randomBetween = (min, max) =>
  Number((Math.random() * (max - min) + min).toFixed(2));

/* ---------------------- Save to DB ---------------------- */
async function storeStocks() {
  try {
    for (const row of data) {
      const stockData = {
        symbol: row.Symbol,
        companyName: row["Company Name"],

        // Numbers
        marketCap:
          Number(
            row["Average market capitalisation from July  01, 2024 to December 31, 2024 (Rs. In lakhs)"]
          ) || randomBetween(1000, 1000000),

        // Strings
        sector:
          row.Sector ||
          ["Finance", "Technology", "Energy", "FMCG"][Math.floor(Math.random() * 4)],
        industry:
          row.Industry ||
          ["Banking", "IT Services", "Oil & Gas", "Consumer Goods"][
            Math.floor(Math.random() * 4)
          ],

        // Financials (random if missing)
        peRatio: row.peRatio || randomBetween(10, 40),
        dividendYield: row.dividendYield || randomBetween(0, 5),
        beta: row.beta || randomBetween(0.5, 2),
        volume: row.volume || Math.floor(randomBetween(100000, 5000000)),
        price: row.price || randomBetween(100, 4000),
        exchange: row.Exchange || "NSE",
        eps: row.eps || randomBetween(1, 100),
        yearHigh: row.yearHigh || randomBetween(500, 8000),
        yearLow: row.yearLow || randomBetween(50, 500),
        priceChange1d: row.priceChange1d || randomBetween(-5, 5),
        priceChange1y: row.priceChange1y || randomBetween(-50, 100),
        lastUpdated: new Date(),
      };

      // Upsert (insert if not exists, else update)
      await Stock.findOneAndUpdate({ symbol: stockData.symbol }, stockData, {
        upsert: true,
        new: true,
      });

      console.log(`✅ Stored/Updated: ${stockData.symbol}`);
    }

    console.log("🎉 All stocks stored successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error storing stocks:", err);
    mongoose.disconnect();
  }
}

storeStocks();
