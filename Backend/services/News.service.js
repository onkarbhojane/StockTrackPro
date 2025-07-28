import axios from "axios";
import dotenv from "dotenv";
import News from "../Models/news.models.js";

dotenv.config();

const API_KEY = process.env.News_API_KEY;
const BASE_URL = "https://api.marketaux.com/v1/news/all";

const industries = [
  "Technology",
  "Financials",
  "Energy",
  "Healthcare",
  "Industrials",
  "Consumer Discretionary",
  "Telecommunication",
  "Utilities",
  "Real Estate",
  "Materials",
];

function getPublishedAfterTime() {
  const now = new Date();
  now.setHours(now.getHours() - 8); // Last 8 hours
  return now.toISOString().split(".")[0];
}

export const fetchAndSaveNews = async () => {
  let requestCount = 0;
  const limit = 3; // articles per page
  const maxPages = 5; // you can increase based on your quota

  console.log(`🔄 Fetching general market news...\n`);

  for (let industry of industries) {
    for (let page = 1; page <= maxPages; page++) {
      if (requestCount >= 100) break;

      const params = {
        api_token: API_KEY,
        industries: industry,
        countries: "in",
        language: "en",
        must_have_entities: true,
        group_similar: true,
        published_after: getPublishedAfterTime(),
        limit,
        page,
      };

      try {
        const res = await axios.get(BASE_URL, { params });
        const articles = res.data?.data || [];
        const returned = res.data?.meta?.returned || 0;

        console.log(`📦 [${industry}] Page ${page} - Fetched ${returned} articles`);

        for (const article of articles) {
          const exists = await News.findOne({ uuid: article.uuid });
          if (!exists) {
            await News.create({
              uuid: article.uuid,
              title: article.title,
              description: article.description,
              snippet: article.snippet,
              url: article.url,
              image_url: article.image_url,
              language: article.language,
              published_at: article.published_at,
              source: article.source,
              relevance_score: article.relevance_score,
              entities: article.entities || [],
              similar: article.similar || [],
            });
          }
        }

        requestCount++;

        // If fewer results returned than limit, we're done with pages
        if (returned < limit) break;

      } catch (err) {
        console.error(`❌ Error fetching news [${industry}, page ${page}]: ${err.message}`);
        break; // stop paging if any error
      }
    }
  }

  console.log(`\n🔚 Completed. Total API Requests Sent: ${requestCount}`);
};
