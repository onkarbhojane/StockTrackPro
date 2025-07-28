import axios from "axios";
import * as cheerio from 'cheerio'
const API_KEY = process.env.API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3/";


const stockDashboard= async(req,res)=>{

    const url = `https://www.google.com/finance/quote/hl:en`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000 // 10 seconds timeout
        });

        if (response.status !== 200) {
            return res.status(502).json({ error: 'Failed to fetch data from Google Finance' });
        }

        const $ = cheerio.load(response.data);
        const Indices = [];
        const Gainers=[];
        const Loosers=[];
        console.log("req got ")
        // Iterate through each news item container
        // $('.lkR3Y').each((index, element) => {
        //     try {
        //         const $element = $(element);
        //         console.log($element)
        //         // Extract news details with fallbacks
        //         const title = $element.find('.pKBk1e').text().trim() || 'No title available';
        //         const cost = $element.find('.YM1Kec').text().trim() || '0';
        //         const percentChange = $element.find('.NMm5M') || '0';
        //         console.log(title,cost,percentChange,"ppppppppppppppppppppppp");
        //         // Indices.push({ title, cost, percentChange });
        //     } catch (elementError) {
        //         console.error('Error processing news element:', elementError);
        //     }
        // });

        $('ul.sbnBtf li').each((index, element) => {
            const $li = $(element);
            const symbol = $li.find('.COaKTb').text().trim();
            const name = $li.find('.ZvmM7').text().trim();
            const price = $li.find('.YMlKec').text().trim();
            const change = $li.find('.P2Luy.Ez2Ioe').text().trim();
            const changePercent = $li.find('.JwB6zf').text().trim();

            if (symbol && price) {
                Gainers.push({
                    symbol,
                    name,
                    price,
                    change,
                    changePercent
                });
            }
        });


        $('ul.sbnBtf li').each((index, element) => {
            const $li = $(element);
            const symbol = $li.find('.COaKTb').text().trim();
            const name = $li.find('.ZvmM7').text().trim();
            const price = $li.find('.YMlKec').text().trim();
            const change = $li.find('.P2Luy.Ez2Ioe').text().trim();
            const changePercent = $li.find('.JwB6zf').text().trim();

            if (symbol && price) {
                Gainers.push({
                    symbol,
                    name,
                    price,
                    change,
                    changePercent
                });
            }
            console.log(element)
        });
        res.json({Gainers,Indices})

    } catch (error) {
        console.error('Error fetching data:', error);
        const status = error.response?.status || 500;
        const message = error.message || 'Error fetching stock news';
        res.status(status).json({ 
            error: message,
            details: error.response?.data || 'No additional details'
        });
    }
}

export default stockDashboard;