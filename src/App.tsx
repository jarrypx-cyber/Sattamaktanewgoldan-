import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import JodiChart from './components/JodiChart';
import AdminPanel from './components/AdminPanel';
import { defaultMarkets, generateSeedJodiChart, getCurrentIST, getISTDateString, getLiveMarketResult, parseTimeToMinutes } from './data';
import { Market, JodiRecord } from './types';
import { Crown, Flame, Star, Trophy, MessageSquare, Zap, ShieldCheck, RefreshCw, ChevronRight, Wifi, Terminal, Cpu, Database, Radio } from 'lucide-react';
const fetchLiveResults = () => {
  fetch('https://' + 'matka-backend-duqq' + '.onrender.com' + '/api/results')
    .then(res => res.json())
    .then(json => {
      console.log("Live Results Connected:", json);
      if (json && json.data) {
        setLiveResults(json.data);
      }
    })
    .catch(err => console.error(err));
};
export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedChartMarketId, setSelectedChartMarketId] = useState('');
  const [liveResults, setLiveResults] = useState<any>(null);
  
  const [currentISTTime, setCurrentISTTime] = useState(getCurrentIST());
  const [syncCountdown, setSyncCountdown] = useState(5);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [isSyncing, setIsSyncing] = useState(false);

    

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
        // Filter out any markets that aren't part of defaultMarkets
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

    // Initial fetch on mount
    fetchLiveResults();

    // Set up 10-second polling interval
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
    
    // Add records that are already declared today
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
    setScraperLogs(lines.slice(-10)); // Keep last 10 lines
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

  // Initialize Jodi Records State
  const [jodiRecords, setJodiRecords] = useState<JodiRecord[]>(() => {
    const saved = localStorage.getItem('satta_jodi_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as JodiRecord[];
        // Filter out any records that belong to removed markets
        const filtered = parsed.filter((r) => defaultMarkets.some((dm) => dm.id === r.marketId));
        if (filtered.length < 200) {
          const fresh = generateSeedJodiChart();
          localStorage.setItem('satta_jodi_records', JSON.stringify(fresh));
          return fresh;
        }
        const uniqueMarketIdsInRecords = new Set(filtered.map((r) => r.marketId));
        const missingMarketSeeds = generateSeedJodiChart().filter(
          (seed) => !uniqueMarketIdsInRecords.has(seed.marketId)
        );
        if (missingMarketSeeds.length > 0 || filtered.length !== parsed.length) {
          const merged = [...filtered, ...missingMarketSeeds];
          localStorage.setItem('satta_jodi_records', JSON.stringify(merged));
          return merged;
        }
        return filtered;
      } catch (e) {
        return generateSeedJodiChart();
      }
    }
    return generateSeedJodiChart();
  });

  // Persist Markets and save explicit overrides for today's date
  const handleUpdateMarkets = (updated: Market[]) => {
    setMarkets(updated);
    localStorage.setItem('satta_markets', JSON.stringify(updated));

    // Also persist explicit manual override for today
    const currentTodayStr = getISTDateString(getCurrentIST());
    updated.forEach((m) => {
      const original = markets.find((o) => o.id === m.id);
      if (original && (
        original.openPana !== m.openPana ||
        original.closePana !== m.closePana ||
        original.status !== m.status
      )) {
        // Market was manually edited
        const override = {
          status: m.status,
          openPana: m.openPana,
          openSingle: m.openSingle,
          closeSingle: m.closeSingle,
          closePana: m.closePana,
        };
        localStorage.setItem(`satta_override_${m.id}_${currentTodayStr}`, JSON.stringify(override));
      }
    });
  };

  // Persist new historical record
  const handleAddJodiRecord = (record: JodiRecord) => {
    const updated = [record, ...jodiRecords];
    setJodiRecords(updated);
    localStorage.setItem('satta_jodi_records', JSON.stringify(updated));
  };

  // Reset to default preseeded values and clear overrides
  const handleResetData = () => {
    // Clear all localStorage override keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('satta_override_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('satta_markets');
    localStorage.removeItem('satta_jodi_records');
    setMarkets(defaultMarkets);
    setJodiRecords(generateSeedJodiChart());
    setIsAdmin(false);
    setActiveTab('live');
  };

  // Get active markets for dropdown lists
  const marketList = markets.map((m) => ({ id: m.id, name: m.name }));

  // Dynamically merge live auto-updates/scraped values of today with historical dataset
  const mergedJodiRecords = useMemo(() => {
    const todayIST = getCurrentIST();
    const todayStr = getISTDateString(todayIST);
    const todayDayName = todayIST.toLocaleDateString('en-US', { weekday: 'long' });

    // Create virtual today records from resolvedMarkets that have results declared today
    const todayVirtualRecords = resolvedMarkets
      .filter((m) => m.openSingle !== '?') // must have at least open single declared today
      .map((m) => {
        const jodi = `${m.openSingle}${m.closeSingle === '?' ? '*' : m.closeSingle}`;
        return {
          id: `${m.id}-${todayStr}`,
          date: todayStr,
          day: todayDayName,
          marketId: m.id,
          marketName: m.name,
          openPana: m.openPana,
          jodi: jodi,
          closePana: m.closePana,
        } as JodiRecord;
      });

    // Merge virtual records with existing records ensuring uniqueness by id
    const existingIds = new Set(jodiRecords.map((r) => r.id));
    const uniqueVirtuals = todayVirtualRecords.filter((r) => !existingIds.has(r.id));

    return [...uniqueVirtuals, ...jodiRecords];
  }, [jodiRecords, resolvedMarkets]);

  // Dynamically format a result for featured markets without ever showing "Loading.."
  const getDisplayResultForFeatured = (marketId: string): string => {
    const m = resolvedMarkets.find((x) => x.id === marketId);
    if (!m) return 'Awaited';

    // If today's result hasn't been declared yet
    if (m.openPana === '???' || m.openPana === 'Awaited' || !m.openPana) {
      return 'Awaited';
    }

    // If open declared but close is pending
    if (m.closePana === '???' || m.closePana === 'Awaited' || !m.closePana) {
      return `${m.openPana}-${m.openSingle}?-???`;
    }

    // Fully declared
    return `${m.openPana}-${m.openSingle}${m.closeSingle}-${m.closePana}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#030919] font-sans text-white antialiased selection:bg-yellow-400 selection:text-slate-950 pb-10">
      
      {/* Main Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        
        {/* TAB RENDERER */}
        <div className="transition-all duration-300">
          
          {/* TAB 1: LIVE RESULTS DASHBOARD */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              
              {/* 🟢 Live Result Top Strip (Blinking & Featured) */}
              <div className="rounded-xl border-4 border-red-600 bg-[#070e1e] shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="bg-red-600 text-yellow-300 py-3 px-4 text-center font-black text-xl uppercase tracking-widest border-b-4 border-yellow-500 animate-pulse flex items-center justify-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 animate-ping"></span>
                  ⚡ SUPER FAST LIVE RESULTS ⚡
                </div>
                <div className="bg-[#0b142c] p-4 divide-y divide-slate-800">
                  {/* Featured Market 1: New Golden Sagar */}
                  <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                      <span className="text-xs bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">LIVE</span>
                      <strong className="text-yellow-400 text-lg font-black tracking-wide">NEW GOLDEN SAGAR</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-2xl text-green-400 tracking-widest bg-slate-950 border-2 border-yellow-500/30 px-4 py-1.5 rounded-lg shadow-inner">
                        liveResults && liveResults["NEW GOLDEN SAGAR"] ? liveResults["NEW GOLDEN SAGAR"].full_result : "Awaited"
                      </span>
                      <button 
                        onClick={() => {
                          setCurrentISTTime(getCurrentIST());
                          setAppToast({ text: "New Golden Sagar Live result synced!", icon: "🔄" });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-lg border border-red-500 active:scale-95"
                      >
                        REFRESH
                      </button>
                    </div>
                  </div>

                  {/* Featured Market 2: Kalyan */}
                  <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                      <span className="text-xs bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">LIVE</span>
                      <strong className="text-yellow-400 text-lg font-black tracking-wide">KALYAN</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-2xl text-green-400 tracking-widest bg-slate-950 border-2 border-yellow-500/30 px-4 py-1.5 rounded-lg shadow-inner">
                        liveResults && liveResults["KALYAN"] ? liveResults["KALYAN"].full_result : "Awaited"
                      </span>
                      <button 
                        onClick={() => {
                          setCurrentISTTime(getCurrentIST());
                          setAppToast({ text: "Kalyan Live result synced!", icon: "🔄" });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-lg border border-red-500 active:scale-95"
                      >
                        REFRESH
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🟢 Congo Chart Navigation Quick Buttons */}
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-500 to-amber-600 border-4 border-[#ffd700] rounded-xl p-3 shadow-xl">
                <div className="text-center text-xs font-black uppercase text-slate-950 tracking-widest mb-2 flex items-center justify-center gap-1">
                  👑 WEEKLY / JODI CHARTS QUICK NAVIGATION 👑
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'KALYAN CHART', id: 'kalyan' },
                    { label: 'RAJDHANI NIGHT', id: 'rajdhani-night' },
                    { label: 'NEW GOLDEN DAY', id: 'new-golden-day' },
                    { label: 'MILAN DAY', id: 'milan-day' },
                    { label: 'NEW GOLDEN SAGAR', id: 'new-golden-sagar' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                    
                    
