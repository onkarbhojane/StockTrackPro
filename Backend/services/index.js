import puppeteer from 'puppeteer';
import sanitize from 'sanitize-filename';
import fs from 'fs';

(async () => {
    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set the URL for your query
        const query = 'ireda share price';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        // Navigate to the search results page
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Wait for the stock price element to load
        await page.waitForSelector('.IsqQVc.NprOob', { timeout: 10000 });

        // Scrape the stock price
        const stockPrice = await page.$eval('.IsqQVc.NprOob', el => el.textContent);

        // Scrape additional details (if needed)
        const companyName = await page.$eval('.zzDege', el => el.textContent);

        // Save results
        const sanitizedFileName = sanitize(query);
        const result = {
            companyName,
            stockPrice,
            scrapedAt: new Date().toISOString(),
        };

        if (!fs.existsSync('./results')) {
            fs.mkdirSync('./results');
        }
        fs.writeFileSync(`./results/${sanitizedFileName}.json`, JSON.stringify(result, null, 2));

        console.log(`Scraped successfully:`, result);

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error while scraping:', error.message);
    }
})();
