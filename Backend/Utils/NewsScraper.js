import { StaticScraper } from "scraperjs";

// Endpoint to scrape top ratios data from the company page
const NewsScraper = async (req, res) => {
  try {
    // Extract the "url" query parameter (in this case, it's the company code)
    const { url } = req.query;
    console.log(url);
    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Construct the full URL for the target company
    const fullUrl = `https://www.screener.in/company/${url}/`;

    // Use StaticScraper to scrape the page.
    const mappedData = await StaticScraper.create(fullUrl).scrape(($) => {
      const data = [];
      // Select each list item within the #top-ratios container
      $("#top-ratios li").each((i, el) => {
        // Extract the key from the .name span and trim extra whitespace
        const key = $(el).find(".name").text().trim();
        // Extract the value from the .nowrap.value span, collapse whitespace and trim
        const value = $(el)
          .find(".nowrap.value")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        data.push({ key, value });
      });
      return data;
    });

    return res.status(200).json({ stockData: mappedData });
  } catch (error) {
    console.error("Error fetching news:", error);
    return res.status(500).json({ error: "Error fetching news" });
  }
};

// Endpoint to scrape complete company information including top ratios,
// company description, and key financials
const CompleteInfo = async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: "Symbol parameter is required" });
    }

    const fullUrl = `https://www.screener.in/company/${symbol}/`;

    // Scrape the full page using StaticScraper
    const scrapedData = await StaticScraper.create(fullUrl).scrape(($) => {
      let data = {};

      // **1. Top Ratios**
      data.topRatios = [];
      $("#top-ratios li").each((i, el) => {
        const key = $(el).find(".name").text().trim();
        const value = $(el)
          .find(".nowrap.value")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        data.topRatios.push({ key, value });
      });

      // **2. Company Description**
      data.description = $("#company-info").text().trim();

      // **3. Key Financials (Revenue, Net Profit, etc.)**
      data.financials = {};
      $("#profit-loss tbody tr").each((i, el) => {
        const key = $(el).find("td:first-child").text().trim();
        const values = $(el)
          .find("td:not(:first-child)")
          .map((j, td) => $(td).text().trim())
          .get();
        data.financials[key] = values;
      });
      console.log(data)

      return data;
    });

    return res.status(200).json({ stockData: scrapedData });
  } catch (error) {
    console.error("Error scraping data:", error);
    return res.status(500).json({ error: "Error fetching stock data" });
  }
};

export default NewsScraper;
export { CompleteInfo };
