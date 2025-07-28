import express from "express";

const router = express.Router();
import MarketDataController from "../Controllers/MarketData.js";

router.get('/', MarketDataController);

export default router;