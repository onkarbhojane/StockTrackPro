import express from "express";
import { filteredNews, Translate } from "../Controllers/NewsController.js";

const router = express.Router();
router.get("/", (req, res) => {
  res.status(200).json({ message: "News API is working" });
});
router.get("/all", filteredNews);
router.post("/translate", Translate);
export default router;
