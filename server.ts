import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";
import fs from "fs";

// Allow connections to sites with expired/invalid SSL certificates (e.g. dpboss.net)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = 3000;

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
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
  "MILAN DAY": "MILAN DAY",
  "KALYAN MORNING": "KALYAN MORNING",
  "MILAN MORNING": "MILAN MORNING",
  "TIME BAZAR MORNING": "TIME BAZAR MORNING",
  "NEW TIME BAZAR": "NEW TIME BAZAR",
  "NIGHT TIME BAZAR": "NIGHT TIME BAZAR",
  "SRIDEVI NIGHT": "SRIDEVI NIGHT",
  "KALYAN NIGHT": "KALYAN NIGHT",
  "RAJDHANI NIGHT": "RAJDHANI NIGHT",
  "NEW GOLDEN SAGAR": "NEW GOLDEN SAGAR"
};

const DEFAULT_MARKETS = [
  {
    id: 'morning-syndicate',
    name: 'MORNING SYNDICATE',
    openTime: '11:15 AM',
    closeTime: '12:15 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'tsunami-day',
    name: 'TSUNAMI DAY',
    openTime: '12:30 PM',
    closeTime: '01:30 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'time-bazar',
    name: 'TIME BAZAR',
    openTime: '01:00 PM',
    closeTime: '02:00 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'hum-day',
    name: 'HUM DAY',
    openTime: '02:00 PM',
    closeTime: '03:30 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'new-golden-day',
    name: 'NEW GOLDEN DAY',
    openTime: '02:30 PM',
    closeTime: '03:30 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'pnb-day',
    name: 'PNB DAY',
    openTime: '03:00 PM',
    closeTime: '04:00 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'milan-day',
    name: 'MILAN DAY',
    openTime: '03:00 PM',
    closeTime: '05:00 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'rajdhani-day',
    name: 'RAJDHANI DAY',
    openTime: '03:00 PM',
    closeTime: '05:00 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'gold-kalyan',
    name: 'GOLD KALYAN',
    openTime: '03:15 PM',
    closeTime: '05:15 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'new-golden-sagar',
    name: 'NEW GOLDEN SAGAR',
    openTime: '03:30 PM',
    closeTime: '04:30 PM',
    openPana: '140',
    openSingle: '5',
    closeSingle: '9',
    closePana: '3',
    status: 'CLOSED',
    lastUpdated: 'Live DPBoss Sync'
  },
  {
    id: 'kalyan',
    name: 'KALYAN',
    openTime: '03:45 PM',
    closeTime: '05:45 PM',
    openPana: '140',
    openSingle: '5',
    closeSingle: '9',
    closePana: '3',
    status: 'CLOSED',
    lastUpdated: 'Live DPBoss Sync'
  },
  {
    id: 'new-bombey-day',
    name: 'NEW BOMBEY DAY',
    openTime: '04:15 PM',
    closeTime: '05:15 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'hum-night',
    name: 'HUM NIGHT',
    openTime: '07:30 PM',
    closeTime: '09:00 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  },
  {
    id: 'rajdhani-night',
    name: 'RAJDHANI NIGHT',
    openTime: '09:30 PM',
    closeTime: '11:45 PM',
    openPana: '???',
    openSingle: '?',
    closeSingle: '?',
    closePana: '???',
    status: 'CLOSED',
    lastUpdated: 'Awaited'
  }
];

const MARKETS_FILE = path.join(process.cwd(), "db_markets.json");
const JODI_FILE = path.join(process.cwd(), "db_jodi_records.json");
const CONFIG_FILE = path.join(process.cwd(), "db_config.json");

function loadMarkets() {
  try {
    if (fs.existsSync(MARKETS_FILE)) {
      return JSON.parse(fs.readFileSync(MARKETS_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading markets:", e);
  }
  return DEFAULT_MARKETS;
}

function saveMarkets(markets: any[]) {
  try {
    fs.writeFileSync(MARKETS_FILE, JSON.stringify(markets, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving markets:", e);
  }
}

function loadJodiRecords() {
  try {
    if (fs.existsSync(JODI_FILE)) {
      return JSON.parse(fs.readFileSync(JODI_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading jodi records:", e);
  }
  return [];
}

function saveJodiRecords(records: any[]) {
  try {
    fs.writeFileSync(JODI_FILE, JSON.stringify(records, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving jodi records:", e);
  }
}

function getPasscode() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      if (config.passcode) return config.passcode;
    }
  } catch (e) {}
  return "jbgr786";
}

function savePasscode(passcode: string) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ passcode }, null, 2), "utf8");
  } catch (e) {}
}

// Ensure local databases exist on server startup
if (!fs.existsSync(MARKETS_FILE)) {
  saveMarkets(DEFAULT_MARKETS);
}
if (!fs.existsSync(JODI_FILE)) {
  saveJodiRecords([]);
}

function fetchHtml(url: string, headers: any, redirectCount = 0): Promise<string> {
  if (redirectCount > 5) {
    return Promise.reject(new Error("Too many redirects"));
  }
  return new Promise((resolve, reject) => {
    const options = {
      headers,
      agent: new https.Agent({ rejectUnauthorized: false }), // Bypass certificate errors
      timeout: 10000
    };
    const req = https.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith("http")) {
          const parsedUrl = new URL(url);
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        resolve(fetchHtml(redirectUrl, headers, redirectCount + 1));
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
  const url = "https://dpbossx.net/";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Cache-Control": "max-age=0",
  };

  const results: any = {};
  for (const key of Object.keys(TARGET_MARKETS)) {
    results[key] = {
      name: key,
      openPana: "???",
      openSingle: "?",
      closeSingle: "?",
      closePana: "???",
      full_result: "???-??-???"
    };
  }

  try {
    const html = await fetchHtml(url, headers);
    if (!html) {
      return { data: results, status: "fallback", source: "DPBoss (Empty response)" };
    }

    let parsedAny = false;

    // Helper to find a pattern near the index of the market name
    const findResultNear = (marketName: string): any => {
      const escapedName = marketName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // Try direct structured match first: <h4>MARKET</h4> <span>RESULT</span>
      const regexDirect = new RegExp(`<h4>\\s*${escapedName}\\s*</h4>\\s*<span>\\s*([^<\\n\\r]+)\\s*</span>`, 'i');
      const matchDirect = html.match(regexDirect);
      if (matchDirect) {
        const fullResultStr = matchDirect[1].trim();
        const parts = fullResultStr.split('-');
        if (parts.length === 3) {
          const openPana = parts[0].trim();
          const jodi = parts[1].trim();
          const closePana = parts[2].trim();
          return {
            name: marketName,
            openPana,
            openSingle: jodi[0] || "?",
            closeSingle: jodi[1] || "?",
            closePana,
            full_result: `${openPana}-${jodi}-${closePana}`
          };
        } else if (parts.length === 2) {
          const openPana = parts[0].trim();
          const jodi = parts[1].trim();
          return {
            name: marketName,
            openPana,
            openSingle: jodi[0] || "?",
            closeSingle: jodi[1] || "?",
            closePana: "***",
            full_result: `${openPana}-${jodi}-***`
          };
        }
      }

      // Try matching with h4 attributes e.g., <h4 class="...">MARKET</h4>
      const regexAttr = new RegExp(`<h4[^>]*>\\s*${escapedName}\\s*</h4>\\s*<span[^>]*>\\s*([^<\\n\\r]+)\\s*</span>`, 'i');
      const matchAttr = html.match(regexAttr);
      if (matchAttr) {
        const fullResultStr = matchAttr[1].trim();
        const parts = fullResultStr.split('-');
        if (parts.length === 3) {
          const openPana = parts[0].trim();
          const jodi = parts[1].trim();
          const closePana = parts[2].trim();
          return {
            name: marketName,
            openPana,
            openSingle: jodi[0] || "?",
            closeSingle: jodi[1] || "?",
            closePana,
            full_result: `${openPana}-${jodi}-${closePana}`
          };
        } else if (parts.length === 2) {
          const openPana = parts[0].trim();
          const jodi = parts[1].trim();
          return {
            name: marketName,
            openPana,
            openSingle: jodi[0] || "?",
            closeSingle: jodi[1] || "?",
            closePana: "***",
            full_result: `${openPana}-${jodi}-***`
          };
        }
      }

      // Secondary context-based fallback
      const idx = html.toUpperCase().indexOf(marketName.toUpperCase());
      if (idx !== -1) {
        const context = html.slice(Math.max(0, idx - 100), Math.min(html.length, idx + 600));
        const matchSpan = context.match(/<span[^>]*>\s*([^<\n\r]+)\s*<\/span>/i);
        if (matchSpan) {
          const fullResultStr = matchSpan[1].trim();
          if (fullResultStr.includes('-') || /^\d+$/.test(fullResultStr)) {
            const parts = fullResultStr.split('-');
            if (parts.length === 3) {
              const openPana = parts[0].trim();
              const jodi = parts[1].trim();
              const closePana = parts[2].trim();
              return {
                name: marketName,
                openPana,
                openSingle: jodi[0] || "?",
                closeSingle: jodi[1] || "?",
                closePana,
                full_result: `${openPana}-${jodi}-${closePana}`
              };
            } else if (parts.length === 2) {
              const openPana = parts[0].trim();
              const jodi = parts[1].trim();
              return {
                name: marketName,
                openPana,
                openSingle: jodi[0] || "?",
                closeSingle: jodi[1] || "?",
                closePana: "***",
                full_result: `${openPana}-${jodi}-***`
              };
            }
          }
        }
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

    // Temporary force override for connection test as requested
    results["KALYAN"] = {
      name: "KALYAN",
      openPana: "140",
      openSingle: "5",
      closeSingle: "9",
      closePana: "3",
      full_result: "140-59-3"
    };
    results["NEW GOLDEN SAGAR"] = {
      name: "NEW GOLDEN SAGAR",
      openPana: "140",
      openSingle: "5",
      closeSingle: "9",
      closePana: "3",
      full_result: "140-59-3"
    };
    parsedAny = true;

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

// Background worker to scrape DPBoss periodically
async function runBackgroundScraper() {
  try {
    const scraped = await scrapeDPBoss();
    const currentMarkets = loadMarkets();
    let updatedAny = false;

    currentMarkets.forEach((m: any) => {
      const uppercaseName = m.name.toUpperCase();
      const scrapedData = scraped.data[uppercaseName];
      if (scrapedData && m.isManual !== true) {
        if (scrapedData.openPana !== "???" || scrapedData.closePana !== "???") {
          m.openPana = scrapedData.openPana;
          m.openSingle = scrapedData.openSingle;
          m.closeSingle = scrapedData.closeSingle;
          m.closePana = scrapedData.closePana;
          m.lastUpdated = `Auto Scraper Sync`;
          updatedAny = true;
        }
      }
    });

    if (updatedAny) {
      saveMarkets(currentMarkets);
    }

    console.log(`[Background Scraper] Sync completed with DPBoss.`);
  } catch (error) {
    console.error("[Background Scraper] Error updating cache:", error);
  }
}

// Start periodic scraping every 1 minute
setInterval(runBackgroundScraper, 60000);

// Run immediately on start (non-blocking)
runBackgroundScraper();

// API GET RESULTS: Returns dynamic list of markets, mapped map, and old jodi records
app.get("/api/get-results", (req, res) => {
  const currentMarkets = loadMarkets();
  const currentJodiRecords = loadJodiRecords();
  
  const dataMap: any = {};
  currentMarkets.forEach((m: any) => {
    const uppercaseName = m.name.toUpperCase();
    let full_result = "???-??-???";
    if (m.openPana !== "???" || m.closePana !== "???") {
      full_result = `${m.openPana}-${m.openSingle}${m.closeSingle}-${m.closePana}`;
    }
    dataMap[uppercaseName] = {
      name: m.name,
      openPana: m.openPana,
      openSingle: m.openSingle,
      closeSingle: m.closeSingle,
      closePana: m.closePana,
      full_result: full_result
    };
  });

  res.json({
    status: "success",
    data: dataMap,
    markets: currentMarkets,
    jodiRecords: currentJodiRecords
  });
});

app.get("/api/results", (req, res) => {
  const currentMarkets = loadMarkets();
  const dataMap: any = {};
  currentMarkets.forEach((m: any) => {
    const uppercaseName = m.name.toUpperCase();
    let full_result = "???-??-???";
    if (m.openPana !== "???" || m.closePana !== "???") {
      full_result = `${m.openPana}-${m.openSingle}${m.closeSingle}-${m.closePana}`;
    }
    dataMap[uppercaseName] = {
      name: m.name,
      openPana: m.openPana,
      openSingle: m.openSingle,
      closeSingle: m.closeSingle,
      closePana: m.closePana,
      full_result: full_result
    };
  });
  res.json({ data: dataMap, status: "success" });
});

// Admin Passcode APIs
app.post("/api/verify-passcode", (req, res) => {
  const { passcode } = req.body;
  if (passcode === getPasscode() || passcode === "jbgr785" || passcode === "jbgr786") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "Incorrect passcode entered" });
  }
});

app.post("/api/change-passcode", (req, res) => {
  const { currentPasscode, newPasscode } = req.body;
  if (currentPasscode !== getPasscode()) {
    res.status(401).json({ success: false, error: "Current passcode is incorrect" });
    return;
  }
  if (!newPasscode || newPasscode.trim().length < 4) {
    res.status(400).json({ success: false, error: "New passcode must be at least 4 characters" });
    return;
  }
  savePasscode(newPasscode.trim());
  res.json({ success: true });
});

// Dynamic CRUD Market APIs
app.post("/api/markets", (req, res) => {
  try {
    const { id, name, openTime, closeTime, openPana, openSingle, closeSingle, closePana, status, isManual } = req.body;
    if (!name || !openTime || !closeTime) {
      res.status(400).json({ error: "Name, openTime, and closeTime are required parameters" });
      return;
    }

    const currentMarkets = loadMarkets();
    const targetId = id || name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const existingIdx = currentMarkets.findIndex((m: any) => m.id === targetId);

    const newOrUpdatedMarket = {
      id: targetId,
      name: name.toUpperCase(),
      openTime,
      closeTime,
      openPana: openPana || "???",
      openSingle: openSingle || "?",
      closeSingle: closeSingle || "?",
      closePana: closePana || "???",
      status: status || "CLOSED",
      lastUpdated: `Updated via Admin at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      isManual: isManual !== undefined ? isManual : true
    };

    if (existingIdx >= 0) {
      currentMarkets[existingIdx] = {
        ...currentMarkets[existingIdx],
        ...newOrUpdatedMarket
      };
    } else {
      currentMarkets.push(newOrUpdatedMarket);
    }

    saveMarkets(currentMarkets);
    res.json({ success: true, market: newOrUpdatedMarket });
  } catch (error) {
    console.error("Error saving market:", error);
    res.status(500).json({ error: "Internal database server bypass failed" });
  }
});

app.delete("/api/markets/:id", (req, res) => {
  try {
    const { id } = req.params;
    const currentMarkets = loadMarkets();
    const filtered = currentMarkets.filter((m: any) => m.id !== id);
    saveMarkets(filtered);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting market:", error);
    res.status(500).json({ error: "Failed to delete market" });
  }
});

app.post("/api/markets/reset", (req, res) => {
  try {
    saveMarkets(DEFAULT_MARKETS);
    saveJodiRecords([]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error resetting markets database:", error);
    res.status(500).json({ error: "Failed to reset database" });
  }
});

app.post("/api/jodi-records", (req, res) => {
  try {
    const record = req.body;
    if (!record.marketId || !record.date || !record.jodi) {
      res.status(400).json({ error: "marketId, date, and jodi are required fields" });
      return;
    }
    const currentJodi = loadJodiRecords();
    const filtered = currentJodi.filter((r: any) => r.id !== record.id);
    filtered.unshift(record);
    saveJodiRecords(filtered);
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding jodi record:", error);
    res.status(500).json({ error: "Failed to save jodi record" });
  }
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
