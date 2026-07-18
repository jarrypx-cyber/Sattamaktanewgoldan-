import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis API Credentials from Vercel Environment Variables
const REDIS_URL = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

const TARGET_MARKETS = {
  "MILAN MORNING": true, "SRIDEVI": true, "KALYAN MORNING": true, "PADMAVATI": true,
  "MADHUR MORNING": true, "TIME BAZAR": true, "TARA MUMBAI DAY": true, "MILAN DAY": true,
  "MAIN BAZAR CLASSIC": true, "RAJDHANI DAY": true, "SUPREME DAY": true, "KALYAN": true,
  "SRIDEVI NIGHT": true, "MADHUR NIGHT": true, "MINAKSHI NIGHT": true, "MILAN NIGHT": true,
  "RAJDHANI NIGHT": true, "MAIN BAZAR": true, "KALYAN NIGHT": true, "SREEDEVI DAY": true,
  "SUPREME NIGHT": true, "KUBER DAY": true, "KUBER NIGHT": true, "KALYAN MARKET NIGHT": true,
  "MAIN MARKET NIGHT": true, "TIME BAZAR NIGHT": true, "MORNING SYNDICATE": true, "TSUNAMI DAY": true
};

async function scrapeDPBoss() {
  try {
    const response = await fetch('https://dpbossx.net', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const results: Record<string, any> = {};

    $('div, tr, p').each((_, element) => {
      const text = $(element).text().toUpperCase();
      for (const market of Object.keys(TARGET_MARKETS)) {
        if (text.includes(market)) {
          const match = text.match(/(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})/);
          if (match) {
            results[market] = {
              name: market,
              full_result: `${match[1]}-${match[2]}-${match[3]}`,
              openPana: match[1],
              jodi: match[2],
              closePana: match[3]
            };
          }
        }
      }
    });
    return { results };
  } catch (error) {
    return { results: {} };
  }
}

// 1. ROUTE: Admin Panel saves data directly into Upstash DB via native HTTP fetch
app.post("/api/update-result", async (req, res) => {
  const { market, result } = req.body;
  if (!market || !result) {
    return res.status(400).json({ success: false, message: "Market and result required" });
  }
  try {
    if (REDIS_URL && REDIS_TOKEN) {
      await fetch(`${REDIS_URL}/hset/liveResults/${market.toUpperCase()}/${encodeURIComponent(result)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      });
    }
    return res.json({ success: true, message: "Result saved permanently across all mobiles!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ROUTE: Unified Frontend Endpoint fetching shared stable DB values
app.get("/api/get-results", async (req, res) => {
  try {
    let scrapedData = await scrapeDPBoss();
    if (!scrapedData || !scrapedData.results) {
      scrapedData = { results: {} };
    }

    let liveResults: Record<string, string> = {};
    if (REDIS_URL && REDIS_TOKEN) {
      const redisRes = await fetch(`${REDIS_URL}/hgetall/liveResults`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      });
      const data = await redisRes.json() as { result?: string[] };
      if (data && data.result) {
        for (let i = 0; i < data.result.length; i += 2) {
          liveResults[data.result[i]] = data.result[i + 1];
        }
      }
    }

    for (const key of Object.keys(TARGET_MARKETS)) {
      if (liveResults[key]) {
        if (!scrapedData.results[key]) {
          scrapedData.results[key] = { name: key };
        }
        scrapedData.results[key].full_result = liveResults[key];
        
        const parts = liveResults[key].split('-');
        if (parts.length === 3) {
          scrapedData.results[key].openPana = parts[0];
          scrapedData.results[key].jodi = parts[1];
          scrapedData.results[key].closePana = parts[2];
        }
      }
    }
    return res.json(scrapedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
