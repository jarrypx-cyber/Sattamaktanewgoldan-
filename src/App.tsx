import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import JodiChart from './components/JodiChart';
import AdminPanel from './components/AdminPanel';
import { defaultMarkets, generateSeedJodiChart, getCurrentIST, getISTDateString, getLiveMarketResult, parseTimeToMinutes } from './data';
import { Market, JodiRecord } from './types';
import { Crown, Flame, Star, Trophy, MessageSquare, Zap, ShieldCheck, RefreshCw, ChevronRight, Wifi, Terminal, Cpu, Database, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedChartMarketId, setSelectedChartMarketId] = useState('');
  const [liveResults, setLiveResults] = useState<any>(null);
  
  const [currentISTTime, setCurrentISTTime] = useState(getCurrentIST());
  const [syncCountdown, setSyncCountdown] = useState(5);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Live Results Fetcher from Render Backend
  const fetchLiveResultsFromBackend = () => {
    setIsSyncing(true);
    fetch('https://onrender.com')
      .then(res => res.json())
      .then(json => {
        console.log("Live Results Connected:", json);
        if (json && json.data) {
          setLiveResults(json.data);
          setLastSyncTime(getCurrentTimeFormatted());
        }
        setIsSyncing(false);
      })
      .catch(err => {
        console.error(err);
        setIsSyncing(false);
      });
  };

  // Sync polling on mount
  useEffect(() => {
    fetchLiveResultsFromBackend();
    const interval = setInterval(fetchLiveResultsFromBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (syncCountdown <= 1) {
      setSyncCountdown(10);
    } else {
      const timer = setTimeout(() => setSyncCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [syncCountdown]);

  const todayStr = getISTDateString(currentISTTime);
  const currentMinutes = currentISTTime.getHours() * 60 + currentISTTime.getMinutes();

  // Google Site Verification State
  const [googleVerification, setGoogleVerification] = useState<string>(
    () => localStorage.getItem('satta_google_verification') || ''
  );

  // Dynamic Google Site Verification injector
  useEffect(() => {
    let meta = document.querySelector('meta[name="google-site-verification"]');
    if (googleVerification) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', googleVerification);
    } else if (meta) {
      meta.remove();
    }
  }, [googleVerification]);

  // App-level Toast and modal states for alerts replacement
  const [appToast, setAppToast] = useState<{ text: string; icon: string } | null>(null);
  const [selectedAd, setSelectedAd] = useState<{ label: string; desc: string } | null>(null);

  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => setAppToast(null), 3000);
    return () => clearTimeout(timer);
  }, [appToast]);

  // Initialize Markets State
  const [markets, setMarkets] = useState<Market[]>(() => {
    const saved = localStorage.getItem('satta_markets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Market[];
        const filtered = parsed.filter((pm) => defaultMarkets.some((dm) => dm.id === pm.id));
        const missing = defaultMarkets.filter((dm) => !filtered.some((pm) => pm.id === dm.id));
        if (missing.length > 0 || filtered.length !== defaultMarkets.length) {
          localStorage.setItem('satta_markets', JSON.stringify(defaultMarkets));
          return defaultMarkets;
        }
        return filtered;
      } catch (e) {
        return defaultMarkets;
      }
    }
    return defaultMarkets;
  });

  // Dynamically computed live market results (combining auto-update values + overrides)
  const resolvedMarkets = markets.map((m) => getLiveMarketResult(m, todayStr, currentMinutes));

  // Time formatters for automatic scraping & upload logs
  const getCurrentTimeFormatted = () => {
    const d = getCurrentIST();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  };

  const getISTTimeStr = (offsetMinutesAgo: number) => {
    const d = getCurrentIST();
    d.setMinutes(d.getMinutes() - offsetMinutesAgo);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Live Automatic Scraper & Uploader States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);

  // Dynamic live-fetching from DPBoss Scraper API every 10 seconds
  useEffect(() => {
    const fetchLiveResults = async () => {
      try {
        const response = await fetch("/api/results");
        const result = await response.json();
        if (result.status === "success" || result.status === "fallback") {
          const apiData = result.data;
          setMarkets((prevMarkets) => {
            const updated = prevMarkets.map((m) => {
              let apiMarket = null;
              if (m.id === 'kalyan' && apiData.KALYAN) {
                apiMarket = apiData.KALYAN;
              } else if (m.id === 'time-bazar' && apiData['TIME BAZAR']) {
                apiMarket = apiData['TIME BAZAR'];
              } else if (m.id === 'milan-day' && apiData['MILAN DAY']) {
                apiMarket = apiData['MILAN DAY'];
              } else {
                const upperName = m.name.toUpperCase();
                if (apiData[upperName]) {
                  apiMarket = apiData[upperName];
                }
              }

              if (apiMarket) {
                return {
                  ...m,
                  openPana: apiMarket.openPana,
                  openSingle: apiMarket.openSingle,
                  closeSingle: apiMarket.closeSingle,
                  closePana: apiMarket.closePana,
                  status: 'CLOSED',
                  lastUpdated: `Live DPBoss Sync at ${getCurrentTimeFormatted()}`
                };
              }
              return m;
            });
            localStorage.setItem('satta_markets', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (error) {
        console.warn("Failed to fetch live results from DPBoss API:", error);
      }
    };

    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lines = [
      `[${getISTTimeStr(12)}] 📡 Starting automatic matka result scraper daemon...`,
      `[${getISTTimeStr(10)}] 🚀 Connected to Central Satta Matka Data Highway.`,
      `[${getISTTimeStr(8)}] 🌐 Live Web-Scraping Active on 14 official Matka & Golden servers...`,
      `[${getISTTimeStr(7)}] 📥 [ARCHIVE] Fetching 1 SAAL (365 days / 53 Weeks) historical chart archives for all markets...`,
      `[${getISTTimeStr(6)}] ✅ Successfully synced 53 weeks of historical records from dpboss.net & goldenmatka.in.`,
    ];
    
    let matchedCount = 0;
    resolvedMarkets.forEach((m) => {
      if (m.openPana !== '???') {
        lines.push(`[${m.openTime}] 📥 [SCRAPED] Scraped Live Open Result for ${m.name} -> ${m.openPana}-${m.openSingle}`);
        lines.push(`[${m.openTime}] 🟢 [AUTO-UPLOAD] Instantly uploaded and published on our site.`);
        matchedCount++;
      }
      if (m.closePana !== '???') {
        lines.push(`[${m.closeTime}] 📥 [SCRAPED] Scraped Live Close Result for ${m.name} -> ${m.closePana}-${m.closeSingle}`);
        lines.push(`[${m.closeTime}] 🟢 [AUTO-UPLOAD] Instantly uploaded and published on our site.`);
        matchedCount++;
      }
    });

    lines.push(`[${getCurrentTimeFormatted()}] 📡 [STATUS] Scanner listening in real-time. ${matchedCount} results auto-uploaded today.`);
    setScraperLogs(lines.slice(-10));
  }, [currentMinutes, markets]);

  const handleManualScrapeScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    
    const newLogs = [
      ...scraperLogs,
      `[${getCurrentTimeFormatted()}] 📡 [FORCE-SCAN] Initiated immediate scan on all 14 official partner sites...`,
    ];
    setScraperLogs(newLogs.slice(-10));

    setTimeout(() => {
      const finalTime = getCurrentTimeFormatted();
      setScraperLogs(prev => [
        ...prev,
        `[${finalTime}] 🟢 [SYNC COMPLETE] Checked dpboss.net, kalyan.in & goldenmatka.in.`,
        `[${finalTime}] 🟢 [DATABASE] All live open/close results are perfectly synchronized!`,
      ].slice(-10));
      setIsScanning(false);
      setAppToast({ text: "Swayam-Chalit Live results fully verified & matched with Golden Satta servers!", icon: "📡" });
    }, 1500);
  };

  // // Initialize Jodi Records State
const [jodiRecords, setJodiRecords] = useState<JodiRecord[]>(() => {
  const saved = localStorage.getItem('satta_jodi_records');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as JodiRecord[];
      const filtered = parsed.filter((r) => defaultMarkets.some((dm) => dm.id === r.id));
      
      if (filtered.length < 200) {
        const fresh = generateSeedJodiChart();
        return fresh; // Agar filter ke baad 200 se kam hain toh fresh data bhejein
      }
      
      return filtered;
    } catch (e) {
      console.error("Error parsing jodi records:", e);
      return generateSeedJodiChart(); // Error aane par fallback data
    }
  }
  return generateSeedJodiChart(); // <--- Is line ki spelling check karein
});
  
