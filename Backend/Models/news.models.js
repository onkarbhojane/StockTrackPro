// models/News.js
import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  uuid: { type: String, unique: true },
  title: String,
  description: String,
  keywords: String,
  snippet: String,
  url: String,
  image_url: String,
  language: String,
  published_at: Date,
  source: String,
  relevance_score: Number,
  entities: Array,
  similar: Array,
});

const News = mongoose.model("News", newsSchema);
export default News;
