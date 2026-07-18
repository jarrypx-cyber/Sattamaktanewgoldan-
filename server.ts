import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Upstash DB Credentials from Vercel
const REDIS_URL = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

// All Major Live Markets to Track automatically
const TARGET_MARKETS = {
  "MILAN MORNING": true, "SRIDEVI": true, "KALYAN MORNING": true, "PADMAVATI": true,
  "MADHUR MORNING": true, "TIME BAZAR": true, "TARA MUMBAI DAY": true, "MILAN DAY": true,
  "MAIN BAZAR CLASSIC": true, "RAJDHANI DAY": true, "SUPREME DAY": true, "KALYAN": true,
  "SRIDEVI NIGHT": true, "MADHUR NIGHT": true, "MINAKSHI NIGHT": true, "MILAN NIGHT": true,
  "RAJDHANI NIGHT": true, "MAIN BAZAR": true, "KALYAN NIGHT": true, "SREEDEVI DAY": true,
  "SUPREME NIGHT": true, "KUBER DAY": true, "KUBER NIGHT": true, "KALYAN MARKET NIGHT": true,
  "MAIN MARKET NIGHT": true, "TIME BAZAR NIGHT": true, "MORNING SYNDICATE": true, "TSUNAMI DAY": true
};

// Automatic Core Live Scraper Engine
async function fetchGlobalLiveResults() {
  try {
    const response = await fetch('https://dpboss.net', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 5000
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const results: Record<string, any> = {};

    $('div, tr, h5, p').each((_, element) => {
      const text = $(element).text().toUpperCase().trim();
      for (const market of Object.keys(TARGET_MARKETS)) {
        if (text.includes(market)) {
          const match = text.match(/(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})/) || text.match(/(\d{3})\s*-\s*(\d{2})/);
          if (match) {
            const rawResult = match[0].replace(/\s+/g, '');
            const parts = rawResult.split('-');
            results[market] = {
              name: market,
              full_result: rawResult,
              openPana: parts[0] ? parts[0].split('') : [],
              jodi: parts[1] ? parts[1].split('') : [],
              closePana: parts[2] ? parts[2].split('') : []
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

// 1. ROUTE: Admin Manual Overwrite
app.post("/api/update-result", async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
    return res.json({ success: true, message: "Manual update synced permanently!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ROUTE: Unified Frontend Endpoint fetching shared stable DB values with strict cache control
app.get("/api/get-results", async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    let globalData = await fetchGlobalLiveResults();
    if (!globalData || !globalData.results) {
      globalData = { results: {} };
    }

    let liveResults: Record<string, string> = {};
    if (REDIS_URL && REDIS_TOKEN) {
      const redisRes = await fetch(`${REDIS_URL}/hgetall/liveResults`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      });
      const data = await redisRes.json() as { result?: Record<string, string> };
      if (data && data.result && typeof data.result === 'object') {
        for (const [key, val] of Object.entries(data.result)) {
          liveResults[key.toUpperCase()] = String(val);
        }
      }
    }

    for (const key of Object.keys(TARGET_MARKETS)) {
      if (liveResults[key]) {
        if (!globalData.results[key]) globalData.results[key] = { name: key };
        globalData.results[key].full_result = liveResults[key];
        
        const parts = liveResults[key].split('-');
        globalData.results[key].openPana = parts[0] ? parts[0].split('') : [];
        globalData.results[key].jodi = parts[1] ? parts[1].split('') : [];
        globalData.results[key].closePana = parts[2] ? parts[2].split('') : [];
      } else if (!globalData.results[key]) {
        globalData.results[key] = { name: key, full_result: "Awaited", openPana: [], jodi: [], closePana: [] };
      }
    }
    return res.json(globalData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Live sync matrix active on port ${PORT}`);
});
