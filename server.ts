import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Target Markets to Track
const TARGET_MARKETS = {
  "MILAN MORNING": true,
  "SRIDEVI": true,
  "KALYAN MORNING": true,
  "PADMAVATI": true,
  "MADHUR MORNING": true,
  "TIME BAZAR": true,
  "TARA MUMBAI DAY": true,
  "MILAN DAY": true,
  "MAIN BAZAR CLASSIC": true,
  "RAJDHANI DAY": true,
  "SUPREME DAY": true,
  "KALYAN": true,
  "SRIDEVI NIGHT": true,
  "MADHUR NIGHT": true,
  "MINAKSHI NIGHT": true,
  "MILAN NIGHT": true,
  "RAJDHANI NIGHT": true,
  "MAIN BAZAR": true,
  "KALYAN NIGHT": true,
  "SREEDEVI DAY": true,
  "SUPREME NIGHT": true,
  "KUBER DAY": true,
  "KUBER NIGHT": true,
  "KALYAN MARKET NIGHT": true,
  "MAIN MARKET NIGHT": true,
  "TIME BAZAR NIGHT": true,
  "MORNING SYNDICATE": true,
  "TSUNAMI DAY": true
};

// Global memory to store live results from Admin Panel
let liveResults: Record<string, string> = {};

// Helper to clean scraped text
function cleanText(text: string): string {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
}

// Function to Scrape External Data (Automatic Scraper)
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
          // Extracts default pattern 123-45-678 if present
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

// 1. ROUTE: Admin Panel updates results here
app.post("/api/update-result", (req, res) => {
  const { market, result } = req.body;
  if (!market || !result) {
    return res.status(400).json({ success: false, message: "Market and result required" });
  }
  liveResults[market.toUpperCase()] = result;
  return res.json({ success: true, data: liveResults });
});

// 2. ROUTE: Unified endpoint for Frontend to fetch both Scraper & Admin Data
app.get("/api/get-results", async (req, res) => {
  try {
    let scrapedData = await scrapeDPBoss();
    if (!scrapedData || !scrapedData.results) {
      scrapedData = { results: {} };
    }

    // Merge Admin entries over Scraper data
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
        } else {
          scrapedData.results[key].full_result = liveResults[key];
        }
      }
    }
    return res.json(scrapedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
