import express from "express";
import router from "./Routes/Routes.js";
import cors from "cors";
import dotenv from "dotenv";   
import conn from "./DB/conn.js"
import './Controllers/Auth.js'
import './cron/marketNewsJob.js';
import newsRoutes from "./Routes/News.routes.js"
import MarketDataRouter from "./Routes/MarketData.routes.js";
// import './Utils/storeAllStocksDB.js'
// import './'
import './services/LiveData.js'
conn();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

console.log("Environment Variables:", {
  ANGLE_ONE_CLIENT_CODE: process.env.ANGLE_ONE_CLIENT_CODE,
  ANGLE_ONE_API_KEY: process.env.ANGLE_ONE_API_KEY,
  ANGLE_ONE_TOTP: process.env.ANGLE_ONE_TOTP,
  ANGLE_ONE_PIN: process.env.ANGLE_ONE_PIN,
});
// Correct route usage
app.use("/api/user", router);
app.use("/service", router);
app.use("/api/news", newsRoutes);
app.use("/api/market-data", MarketDataRouter);

app.use('/stock',router)



// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
