import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import JodiChart from './components/JodiChart';
import { defaultMarkets, generateSeedJodiChart, getCurrentIST, getISTDateString } from './data';
import { Market, JodiRecord } from './types';
import { Crown, Star, RefreshCw, Radio, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('live');
  const [selectedChartMarketId, setSelectedChartMarketId] = useState<string>('kalyan');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('satta_admin_logged_in') === 'true');

  const [currentISTTime, setCurrentISTTime] = useState<Date>(getCurrentIST());
  const [syncCountdown, setSyncCountdown] = useState<number>(10);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Syncing...');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [markets, setMarkets] = useState<Market[]>(defaultMarkets);
  const [jodiRecords, setJodiRecords] = useState<JodiRecord[]>([]);

  // Track India Standard Time (IST) values
  const todayStr = useMemo(() => getISTDateString(currentISTTime), [currentISTTime]);

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

  const [appToast, setAppToast] = useState<{ text: string; icon: string } | null>(null);

  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => setAppToast(null), 4000);
    return () => clearTimeout(timer);
  }, [appToast]);

  // Unified dynamic loading from central server every 10 seconds
  const fetchLiveResults = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/get-results");
      const result = await response.json();
      if (result.status === "success") {
        if (result.markets && result.markets.length > 0) {
          setMarkets(result.markets);
        }
        if (result.jodiRecords) {
          setJodiRecords(result.jodiRecords);
        }
      }
      const nowIST = getCurrentIST();
      setCurrentISTTime(nowIST);
      setLastSyncTime(nowIST.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    } catch (error) {
      console.warn("Failed to fetch live results from DPBoss API:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Synchronize on mount and handle automatic countdown polling
  useEffect(() => {
    fetchLiveResults();

    const intervalId = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveResults();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Listen to custom result update notifications dispatched by the Admin panel
  useEffect(() => {
    const handleResultEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { marketName, status, openPana } = customEvent.detail;
        if (status === 'RESET') {
          setAppToast({ text: openPana, icon: '🔄' });
        } else {
          setAppToast({
            text: `LIVE declared for ${marketName}! Board fully updated.`,
            icon: '🔊'
          });
        }
        fetchLiveResults(); // instant reload from central server
      }
    };

    window.addEventListener('satta-result-updated', handleResultEvent);
    return () => window.removeEventListener('satta-result-updated', handleResultEvent);
  }, []);

  // Dynamic state sync handlers triggered by the admin panel
  const handleUpdateMarkets = (updated: Market[]) => {
    setMarkets(updated);
  };

  const handleAddJodiRecord = (record: JodiRecord) => {
    setJodiRecords((prev) => [record, ...prev]);
    setAppToast({ text: "Jodi successfully added to the server's central database chart!", icon: "📊" });
  };

  const handleResetData = () => {
    setAppToast({ text: "Central Database reset successfully!", icon: "🔄" });
    fetchLiveResults();
  };

  const handleUpdateGoogleVerification = (val: string) => {
    setGoogleVerification(val);
    localStorage.setItem('satta_google_verification', val);
  };

  // Format local list for charts selection dropdowns
  const marketList = useMemo(() => {
    return markets.map((m) => ({ id: m.id, name: m.name }));
  }, [markets]);

  // Click handler for individual card's small refresh button
  const handleSingleRefresh = async (marketId: string, marketName: string) => {
    try {
      await fetchLiveResults();
      setAppToast({ text: `${marketName} results refreshed directly from database bypass.`, icon: "⚡" });
    } catch (e) {
      setAppToast({ text: "Failed to connect to backend bypass.", icon: "⚠️" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5ec] font-sans text-neutral-900 selection:bg-[#800000] selection:text-white">
      
      {/* HEADER BAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        markets={markets}
        onUpdateMarkets={handleUpdateMarkets}
        onAddJodiRecord={handleAddJodiRecord}
        onResetData={handleResetData}
        googleVerification={googleVerification}
        onUpdateGoogleVerification={handleUpdateGoogleVerification}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        
        {/* UPPER ANNOUNCEMENT BAR (TICKER) */}
        <div className="relative overflow-hidden rounded-xl border-2 border-[#800000] bg-white py-2 px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-[#800000] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white select-none">
              ALERT
            </span>
            <div className="w-full overflow-hidden">
              <p className="whitespace-nowrap text-xs font-black text-[#800000] uppercase tracking-wide animate-marquee">
                ★★★ FASTEST SATTA MATKA LIVE RESULTS HUB • CENTRAL DATABASE BYPASS ACTIVE • REAL TIME DPBOSS SYNCHRONIZER ONLINE ★★★
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS & NAVIGATION TAB LAYOUT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-300 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-[#800000] text-white font-extrabold shadow-md border border-[#800000]'
                  : 'bg-white text-[#800000] border-2 border-[#800000] hover:bg-[#ffeedb]'
              }`}
            >
              📊 LIVE RESULTS
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-[#800000] text-white font-extrabold shadow-md border border-[#800000]'
                  : 'bg-white text-[#800000] border-2 border-[#800000] hover:bg-[#ffeedb]'
              }`}
            >
              📅 JODI CHARTS
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-neutral-800 uppercase flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border-2 border-neutral-300 shadow-sm">
              <Radio className={`h-3 w-3 ${isSyncing ? 'text-red-600 animate-ping' : 'text-green-600'}`} />
              Next Sync: <span className="font-mono text-[#000080] font-black">{syncCountdown}s</span>
            </span>
            <button
              onClick={fetchLiveResults}
              disabled={isSyncing}
              className="rounded-lg bg-[#800000] hover:bg-red-800 text-white font-black text-xs uppercase px-4 py-2 flex items-center gap-1.5 shadow-md border border-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              SYNC NOW
            </button>
          </div>
        </div>

        {/* CONDITIONAL BODY RENDERING */}
        <div className="space-y-8">
          
          {/* TAB 1: LIVE MATKA RESULTS */}
          {activeTab === 'live' && (
            <div className="space-y-6">

              {/* LIVE BOARDS LIST VIEW - DPBOSS STYLE CARD BLOCKS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#ffeedb] p-4 rounded-xl border-2 border-[#800000] shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#800000] flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#000080]" />
                    LIVE Satta Matka Market Results Board
                  </h2>
                  <span className="text-[10px] font-black text-[#000080] uppercase font-mono">
                    IST: {todayStr} • Sync: {lastSyncTime}
                  </span>
                </div>

                {/* DPBoss Style Card Blocks: 1 column list on mobile, 2 columns grid on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {markets.map((m) => {
                    const isGameLive = m.status === 'ACTIVE_CLOSE' || m.id === 'kalyan' || m.id === 'new-golden-sagar';

                    // Compute DPBoss style text output
                    let displayResult = '';
                    let isResultLoading = false;

                    if (m.openPana === '???' || m.openPana === 'Awaited' || !m.openPana) {
                      displayResult = 'Loading...';
                      isResultLoading = true;
                    } else if (m.closePana === '???' || m.closePana === 'Awaited' || !m.closePana) {
                      displayResult = `${m.openPana}-${m.openSingle}`;
                    } else {
                      displayResult = `${m.openPana}-${m.openSingle}${m.closeSingle}-${m.closePana}`;
                    }

                    return (
                      <div
                        key={m.id}
                        className="relative rounded-lg border border-[#800000] bg-[#ffeedb] p-6 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {/* Blinking LIVE label for active updating games */}
                        {isGameLive && (
                          <span className="absolute top-2.5 right-3 flex items-center gap-1 bg-red-600 text-white font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow animate-pulse border border-red-500 select-none">
                            <span className="h-1 w-1 rounded-full bg-white animate-ping"></span>
                            LIVE
                          </span>
                        )}

                        {/* Traditional JODI chart badge button on the left edge */}
                        <button
                          onClick={() => {
                            setSelectedChartMarketId(m.id);
                            setActiveTab('chart');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#000080] hover:bg-[#000066] text-white font-extrabold text-[9px] uppercase tracking-wider py-4 px-2 rounded-l border border-blue-900 shadow-md active:scale-95 transition cursor-pointer"
                          title="Open Jodi Chart"
                        >
                          J<br/>O<br/>D<br/>I
                        </button>

                        {/* Traditional PENAL chart badge button on the right edge */}
                        <button
                          onClick={() => {
                            setSelectedChartMarketId(m.id);
                            setActiveTab('chart');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#800000] hover:bg-[#660000] text-white font-extrabold text-[9px] uppercase tracking-wider py-4 px-1.5 rounded-r border border-red-950 shadow-md active:scale-95 transition cursor-pointer"
                          title="Open Panel Chart"
                        >
                          P<br/>E<br/>N<br/>A<br/>L
                        </button>

                        {/* Market Name: Bold, dark blue, centered, uppercase text */}
                        <h3 className="text-[#000080] font-extrabold font-sans text-lg md:text-xl uppercase tracking-widest leading-none">
                          {m.name}
                        </h3>

                        {/* Live Result Display: Big bold magenta/dark pink text. If no data, show "Loading..." in italics */}
                        <div className="my-2 text-[#c71585] text-3xl sm:text-4xl font-extrabold tracking-widest leading-none drop-shadow-sm font-mono">
                          {isResultLoading ? (
                            <span className="italic font-bold tracking-normal">Loading...</span>
                          ) : (
                            displayResult
                          )}
                        </div>

                        {/* Center Refresh Button directly under results in purple/violet color */}
                        <button
                          onClick={() => handleSingleRefresh(m.id, m.name)}
                          className="bg-[#4b0082] hover:bg-[#3b0066] text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow active:scale-95 transition duration-100 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-2.5 w-2.5" />
                          Refresh
                        </button>

                        {/* Timing details */}
                        <div className="mt-3 text-[10px] font-black text-[#5c3c12] uppercase tracking-wider font-mono">
                          ({m.openTime} TO {m.closeTime})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HISTORICAL JODI CHART */}
          {activeTab === 'chart' && (
            <JodiChart
              records={jodiRecords}
              markets={marketList}
              selectedMarketId={selectedChartMarketId}
              setSelectedMarketId={setSelectedChartMarketId}
            />
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t-4 border-[#800000] bg-[#ffeedb] py-10 text-center px-4 shadow-md">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-[#800000] animate-bounce" />
            <span className="text-xl font-black tracking-widest text-[#800000]">
              👑 MATKAONE
            </span>
          </div>

          <p className="text-[11px] text-neutral-700 max-w-2xl mx-auto leading-relaxed font-bold uppercase">
            Matkaone results are purely informative mathematical simulations. We do not support, endorse, or promote any kind of real-money gambling, illegal wagering, or bet placement. This application acts solely as a result compiler dashboard and past-results panel calculator. Please view responsibly.
          </p>

          <div className="pt-2 text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">
            © 2026 Matkaone Inc. All Rights Reserved. • Fast, Accurate & Royal.
          </div>
        </div>
      </footer>

      {/* App Custom Toast Alert */}
      <AnimatePresence>
        {appToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3.5 rounded-xl border-2 border-[#800000] bg-white p-4 text-sm text-neutral-800 shadow-xl shadow-red-500/10 backdrop-blur-md"
          >
            <span className="text-xl">{appToast.icon}</span>
            <div className="flex-1">
              <p className="font-extrabold text-[#800000] text-xs uppercase tracking-wider">System Alert</p>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-bold">{appToast.text}</p>
            </div>
            <button
              onClick={() => setAppToast(null)}
              className="text-neutral-400 hover:text-neutral-600 text-lg font-bold leading-none px-1 cursor-pointer"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
