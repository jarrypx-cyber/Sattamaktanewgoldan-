import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";

// Allow connections to sites with expired/invalid SSL certificates (e.g. dpboss.net)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

const TARGET_MARKETS = {
  KALYAN: "KALYAN",
  "TIME BAZAR": "TIME BAZAR",
  "MILAN DAY": "MILAN DAY"
};

const fallbackData = {
  KALYAN: {
    name: "KALYAN",
    openPana: "234",
    openSingle: "5",
    closeSingle: "9",
    closePana: "990",
    full_result: "234-59-990"
  },
  "TIME BAZAR": {
    name: "TIME BAZAR",
    openPana: "235",
    openSingle: "0",
    closeSingle: "9",
    closePana: "388",
    full_result: "235-09-388"
  },
  "MILAN DAY": {
    name: "MILAN DAY",
    openPana: "349",
    openSingle: "6",
    closeSingle: "1",
    closePana: "128",
    full_result: "349-61-128"
  }
};

function fetchHtml(url: string, headers: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers,
      agent: new https.Agent({ rejectUnauthorized: false }), // Bypass certificate errors
      timeout: 10000
    };
    const req = https.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve("");
        return;
      }
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout fetching page"));
    });
  });
}

async function scrapeDPBoss() {
  const url = "https://dpboss.net/";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Cache-Control": "max-age=0",
  };

  const results: any = {
    KALYAN: { ...fallbackData.KALYAN },
    "TIME BAZAR": { ...fallbackData["TIME BAZAR"] },
    "MILAN DAY": { ...fallbackData["MILAN DAY"] }
  };

  try {
    const html = await fetchHtml(url, headers);
    if (!html) {
      return { data: results, status: "fallback", source: "DPBoss (Protected/Simulated)" };
    }

    let parsedAny = false;

    // Helper to find a pattern near the index of the market name
    const findResultNear = (marketName: string): any => {
      const idx = html.toUpperCase().indexOf(marketName);
      if (idx === -1) return null;
      
      // Look at a substring of 1000 characters around the market name to find the pattern ddd-dd-ddd
      const context = html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 800));
      
      const match = context.match(/(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{3})/);
      if (match) {
        const openPana = match[1];
        const jodi = match[2];
        const closePana = match[3];
        return {
          name: marketName,
          openPana,
          openSingle: jodi[0] || "?",
          closeSingle: jodi[1] || "?",
          closePana,
          full_result: `${openPana}-${jodi}-${closePana}`
        };
      }
      return null;
    };

    for (const [key, name] of Object.entries(TARGET_MARKETS)) {
      const res = findResultNear(name);
      if (res) {
        results[key] = res;
        parsedAny = true;
      }
    }

    if (parsedAny) {
      return { data: results, status: "success", source: "DPBoss Live Scraper" };
    } else {
      return { data: results, status: "fallback", source: "DPBoss (Protected/Simulated)" };
    }

  } catch (error) {
    console.error("Scraping error:", error);
    return { data: results, status: "fallback", source: "DPBoss (Protected/Simulated)" };
  }
}

// In-memory cache for live results
let cachedResults: any = {
  data: {
    KALYAN: { ...fallbackData.KALYAN },
    "TIME BAZAR": { ...fallbackData["TIME BAZAR"] },
    "MILAN DAY": { ...fallbackData["MILAN DAY"] }
  },
  status: "fallback",
  source: "DPBoss (Initializing)"
};

// Background worker to scrape DPBoss periodically
async function runBackgroundScraper() {
  try {
    const scraped = await scrapeDPBoss();
    cachedResults = scraped;
    console.log(`[Background Scraper] Cache updated. Status: ${scraped.status}, Source: ${scraped.source}`);
  } catch (error) {
    console.error("[Background Scraper] Error updating cache:", error);
  }
}

// Start periodic scraping every 30 seconds
setInterval(runBackgroundScraper, 30000);

// Run immediately on start (non-blocking)
runBackgroundScraper();

app.get("/api/results", (req, res) => {
  res.json(cachedResults);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
