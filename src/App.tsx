import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import JodiChart from './components/JodiChart';
import AdminPanel from './components/AdminPanel';
import { defaultMarkets, getCurrentIST } from './data';
import { Market } from './types';
import { Flame, Terminal, Database, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('live');
  const [selectedChartMarketId, setSelectedChartMarketId] = useState<string>('kalyan');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('satta_admin_logged_in') === 'true');

  const [currentISTTime, setCurrentISTTime] = useState<Date>(getCurrentIST());
  const [syncCountdown, setSyncCountdown] = useState<number>(5);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          setIsSyncing(true);
          const nowIST = getCurrentIST();
          setCurrentISTTime(nowIST);
          setTimeout(() => {
            setIsSyncing(false);
            setLastSyncTime(nowIST.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
          }, 800);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [googleVerification] = useState<string>(() => localStorage.getItem('satta_google_verification') || '');
  const [appToast, setAppToast] = useState<{ text: string; icon: string } | null>(null);

  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => setAppToast(null), 3000);
    return () => clearInterval(timer);
  }, [appToast]);

  const [markets, setMarkets] = useState<Market[]>(() => {
    const saved = localStorage.getItem('satta_markets');
    return saved ? JSON.parse(saved) : defaultMarkets;
  });

  const getCurrentTimeFormatted = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  };

  // Live-fetching synced to the working Render server
  useEffect(() => {
    const fetchLiveResults = async () => {
      const potentialEndpoints = [
        "https://matka-backend-duqq.onrender.com",
        "https://matka-backend-duqq.onrender.com/api/results",
        "https://matka-backend-o9td.onrender.com/api/results"
      ];

      let responseData = null;

      for (const url of potentialEndpoints) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const result = await response.json();
            if (result && (result.data || result.KALYAN || result.status === "success")) {
              responseData = result.data || result;
              break;
            }
          }
        } catch (e) {
          console.log(`Failed fetching from ${url}`);
        }
      }

      if (responseData) {
        setMarkets((prevMarkets) => {
          const updated = prevMarkets.map((m) => {
            let apiMarket = null;
            const upperName = m.name.toUpperCase();
            
            if (m.id === 'kalyan' && responseData.KALYAN) {
              apiMarket = responseData.KALYAN;
            } else if (m.id === 'time-bazar' && responseData['TIME BAZAR']) {
              apiMarket = responseData['TIME BAZAR'];
            } else if (m.id === 'milan-day' && responseData['MILAN DAY']) {
              apiMarket = responseData['MILAN DAY'];
            } else if (responseData[upperName]) {
              apiMarket = responseData[upperName];
            }

            if (apiMarket && apiMarket.openSingle && !String(apiMarket.openSingle).toLowerCase().includes('await')) {
              return {
                ...m,
                openPana: apiMarket.openPana || m.openPana,
                openSingle: apiMarket.openSingle,
                closeSingle: apiMarket.closeSingle,
                closePana: apiMarket.closePana || m.closePana,
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
    };

    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
      <AnimatePresence>
        {appToast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 16 }} exit={{ opacity: 0 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-neutral-900 border border-amber-500/30 text-amber-400 px-5 py-3 rounded-xl shadow-2xl">
            <span className="font-semibold text-sm">{appToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
          <button onClick={() => setActiveTab('live')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'live' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}><Flame className="inline w-4 h-4 mr-2"/>LIVE RESULTS</button>
          <button onClick={() => setActiveTab('charts')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'charts' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}><Database className="inline w-4 h-4 mr-2"/>JODI CHARTS</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'admin' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}><Terminal className="inline w-4 h-4 mr-2"/>PANEL CONTROL</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
              {markets.map((market) => (
                <div key={market.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-neutral-100">{market.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1">Open: {market.openTime} | Close: {market.closeTime}</p>
                    </div>
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-1 rounded border border-amber-500/20">{market.status}</span>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center my-3">
                    <div className="flex justify-center items-center gap-3 text-2xl font-black font-mono">
                      <span className="text-neutral-400">{market.openPana || '---'}</span>
                      <span className="text-amber-500 text-3xl font-black bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                        {market.openSingle ?? '-'}{market.closeSingle ?? '-'}
                      </span>
                      <span className="text-neutral-400">{market.closePana || '---'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-3 pt-2 border-t border-neutral-800/40">
                    <span>{market.lastUpdated || 'Waiting for live sync...'}</span>
                    <button onClick={() => setAppToast({ text: `${market.name} Refreshing...`, icon: "🔄" })} className="text-amber-500 font-bold">REFRESH</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'charts' && (
            <motion.div key="charts" className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <select value={selectedChartMarketId} onChange={(e) => setSelectedChartMarketId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 font-bold text-sm">
                  {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <JodiChart marketId={selectedChartMarketId} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin">
              <AdminPanel markets={markets} setMarkets={setMarkets} googleVerification={googleVerification} setGoogleVerification={() => {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-center space-y-4">
        <div className="max-w-md mx-auto flex items-center justify-between text-[11px] text-neutral-500 bg-neutral-900 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 text-amber-500 ${isSyncing ? 'animate-ping' : ''}`} />
            <span>Sync: <b className="text-neutral-400">{syncCountdown}s</b></span>
          </div>
          <div>Last Sync: <b className="text-neutral-400">{lastSyncTime}</b></div>
        </div>
      </footer>
    </div>
  );
}
                      
