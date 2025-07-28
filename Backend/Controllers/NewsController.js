import News from "../Models/news.models.js";

import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const filteredNews = async (req, res) => {
  const { industry, sentiment, search } = req.query;
  const filter = {};

  if (industry) filter["entities.sector"] = industry;

  if (sentiment === "positive") filter.sentiment_score = { $gte: 0 };
  if (sentiment === "negative") filter.sentiment_score = { $lte: 0 };

  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  try {
    const news = await News.find(filter)
      .sort({ published_at: -1 })
      .limit(10);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch filtered news" });
  }
};


const Translate=async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    console.log(targetLanguage)
    const prompt = `Translate the following text to ${targetLanguage}. Only return the translated version:\n\n"${text}"`;

    const chatCompletion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
    });

    const translation = chatCompletion.choices[0].message;
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
}

export { filteredNews, Translate }
