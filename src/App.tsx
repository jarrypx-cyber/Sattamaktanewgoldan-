Satta Matka New Golden
spark
Gemini
Gemini 3.5 Flash
Ran for 19s
lightbulb
Thought for 18 seconds
Aapka project newgoldan-sagar (ya newgoldansagar) Google AI Studio ke list mein na aane ke piche kuch bahut hi aam (common) wajah hain. Chaliye inhein aasan shabdon mein samajhte hain aur ise theek karte hain:
1. Ye project kis Gmail ID se bana hai?
Hamare system ke mutabik, abhi aap jis AI Studio workspace par kaam kar rahe hain, woh jarrypx@gmail.com se logged in hai.
2. Project kyun nahi dikh raha hai? (Main Reasons & Solutions)
Wajah A: Wrong Gmail Account (Galat ID se login hona)
Agar aapne Google Cloud par newgoldan-sagar project kisi doosri Gmail ID se banaya hai, toh woh jarrypx@gmail.com ke AI Studio mein show nahi hoga.
Kya karein: Apne phone/laptop ke browser mein Google Cloud Console (console.cloud.google.com) kholein. Sabse upar right corner mein apni profile photo par click karke dekhein ki wahan kaunsi Gmail ID select hai. AI Studio aur Cloud Console dono mein ek hi same Gmail ID honi chahiye.
Wajah B: Billing Active Nahi Hai
Google AI Studio mein app ko publish ya link karne ke liye aapke Google Cloud Project par Billing (Free Trial ya Active Billing Account) setup hona zaroori hai.
Aapke aakhri screenshot mein upar ek banner dikh raha hai: "Start your free trial with $300 in credit. Start free."
Kya karein: Iska matlab hai ki aapke is account par billing setup nahi hai. Us "Start free" button par click karke apna free trial aur billing account setup complete karein. Jab tak billing active nahi hogi, project yahan select karne ke liye nahi aayega.
Wajah C: Project Name vs Project ID
AI Studio mein search karte waqt kabhi-kabhi sirf Project Name (jaise newgoldan-sagar) se search nahi hota. Uske liye Exact Project ID ki zaroorat hoti hai.
Kya karein: Google Cloud Console mein jayein, upar project selector dropdown se apna project select karein. Wahan dashboard par aapko Project ID likhi milegi (jaise: newgoldan-sagar-412315 ya uske piche koi number hoga). Us exact ID ko copy karke AI Studio ke search box mein daalein.
Aapko abhi kya karna chahiye? (Step-by-Step):
Google Cloud Console kholkar Billing setup karein: Apne aakhri screenshot wale page (console.cloud.google.com) par jo "Start free" ka button hai, uspar click karke billing activate karein (yeh bilkul free trial hota hai aur isme bina permission paise nahi katte).
Gmail ID check karein: Confirm karein ki dono jagah jarrypx@gmail.com hi login hai.
Project ID copy karein: Cloud Console se exact project ID copy karke yahan AI Studio mein "Import project" wale search box mein paste karein.
In steps ko follow karne ke baad aapka project yahan show hone lagega! Agar koi aur dikkat aaye toh mujhe btaiye.
Is kis ka application hai
Screenshot_20260714-105215.png
Screenshot_20260714-105215.png
Gemini 3.5 Flash
Ran for 0s
error
Quota limits exceeded
Is kis ka application hai
Screenshot_20260714-112557.png
Screenshot_20260714-112557.png
Gemini 3.5 Flash
Ran for 0s
error
Quota limits exceeded
Is kis ka application hai
Screenshot_20260714-112557.png
Screenshot_20260714-112557.png
error
Quota limits exceeded
Mujhe is website ka poora App.jsx code ek single code block me likh kar do takia mai use copy kar sakoon."
Gemini 3.5 Flash
Ran for 27s
lightbulb
Thought for 5 seconds
description
Read file
Aapki website ka poora App.tsx (jise aap App.jsx bhi kehte hain) code niche ek single, copy-friendly code block me diya gaya hai. Aap is pure code ko direct copy karke use kar sakte hain:
code
Tsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JodiChart from './components/JodiChart';
import VipGuessing from './components/VipGuessing';
import RulesInfo from './components/RulesInfo';
import AdminPanel from './components/AdminPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import { defaultMarkets, generateSeedJodiChart } from './data';
import { Market, JodiRecord } from './types';
import { Crown, Flame, Star, Trophy, MessageSquare, Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('live');
  const [selectedChartMarketId, setSelectedChartMarketId] = useState<string>('new-golden-sagar');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('satta_admin_logged_in') === 'true');

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
          const merged = [...filtered, ...missing];
          localStorage.setItem('satta_markets', JSON.stringify(merged));
          return merged;
        }
        return filtered;
      } catch (e) {
        return defaultMarkets;
      }
    }
    return defaultMarkets;
  });

  // Initialize Jodi Records State
  const [jodiRecords, setJodiRecords] = useState<JodiRecord[]>(() => {
    const saved = localStorage.getItem('satta_jodi_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as JodiRecord[];
        // Filter out any records that belong to removed markets
        const filtered = parsed.filter((r) => defaultMarkets.some((dm) => dm.id === r.marketId));
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

  // Persist Markets
  const handleUpdateMarkets = (updated: Market[]) => {
    setMarkets(updated);
    localStorage.setItem('satta_markets', JSON.stringify(updated));
  };

  // Persist new historical record
  const handleAddJodiRecord = (record: JodiRecord) => {
    const updated = [record, ...jodiRecords];
    setJodiRecords(updated);
    localStorage.setItem('satta_jodi_records', JSON.stringify(updated));
  };

  // Reset to default preseeded values
  const handleResetData = () => {
    localStorage.removeItem('satta_markets');
    localStorage.removeItem('satta_jodi_records');
    setMarkets(defaultMarkets);
    setJodiRecords(generateSeedJodiChart());
    setIsAdmin(false);
    setActiveTab('live');
  };

  // Get active markets for dropdown lists
  const marketList = markets.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="min-h-screen w-full bg-[#ccff33] font-sans text-neutral-900 antialiased selection:bg-red-600 selection:text-white pb-10">
      
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
              
              {/* 🟢 Traditional Golden Ank Guessing Card */}
              <div className="rounded-lg border-4 border-red-600 bg-white shadow-lg overflow-hidden max-w-4xl mx-auto mb-6">
                <div className="bg-[#008080] text-yellow-300 px-4 py-3 text-center text-base font-black uppercase tracking-wider border-b-4 border-red-600 font-sans">
                  KALYAN / MAIN BAZAR Golden Ank... {new Date().toLocaleDateString('en-GB')}
                </div>
                <div className="bg-white py-6 px-4 text-center border-b-4 border-red-600">
                  <div className="flex justify-center items-center gap-4 sm:gap-6 text-3xl sm:text-5xl font-mono font-black text-blue-700 tracking-wider">
                    <span>1</span>
                    <span className="text-red-600">-</span>
                    <span>6</span>
                    <span className="text-red-600">-</span>
                    <span>0</span>
                    <span className="text-red-600">-</span>
                    <span>5</span>
                  </div>
                </div>
                <div className="bg-[#ff0000] text-yellow-300 font-serif text-sm font-black uppercase text-center py-2 tracking-widest">
                  ⚡ FAST NEWGOLDANSAGAR LIVE RESULTS ⚡
                </div>
              </div>

              {/* 🟢 Live Results Row List */}
              <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-600 animate-pulse" />
                    <h3 className="text-base font-black uppercase tracking-wider text-neutral-900">
                      🔴 NEWGOLDANSAGAR LIVE RESULTS TIMING BOARDS
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      alert("Refreshed! Latest results loaded.");
                    }}
                    className="bg-red-600 text-white border-2 border-white px-3 py-1 rounded text-xs font-black shadow hover:bg-red-700 active:scale-95 transition-all"
                  >
                    Refresh
                  </button>
                </div>

                <div className="space-y-4">
                  {markets.map((m) => {
                    const displayVal = `${m.openPana === '???' ? '???' : m.openPana} - ${m.openSingle === '?' ? '-' : m.openSingle}${m.closeSingle === '?' ? '-' : m.closeSingle} - ${m.closePana === '???' ? '???' : m.closePana}`;

                    return (
                      <div
                        key={m.id}
                        className="relative bg-[#ffff00] border-4 border-red-600 rounded-lg p-5 flex items-center justify-between shadow-md hover:shadow-lg transition-all"
                      >
                        {/* Left Button: Jodi */}
                        <button
                          onClick={() => {
                            setSelectedChartMarketId(m.id);
                            setActiveTab('chart');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#ff0000] text-white font-black text-xs sm:text-sm px-4 py-2 rounded border-2 border-white shadow hover:scale-105 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                        >
                          Jodi
                        </button>

                        {/* Center Data Block */}
                        <div className="flex-1 text-center px-1">
                          <h3 className="text-xl sm:text-2xl font-black text-[#0000ff] tracking-tight uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                            {m.name}
                          </h3>
                          <div className="my-1.5 text-xl sm:text-3xl font-black text-[#000000] font-mono tracking-wider">
                            {displayVal}
                          </div>
                          <div className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">
                            ({m.openTime} {m.closeTime})
                          </div>
                        </div>

                        {/* Right Button: Panel */}
                        <button
                          onClick={() => {
                            setSelectedChartMarketId(m.id);
                            setActiveTab('chart');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#0000ff] text-white font-black text-xs sm:text-sm px-4 py-2 rounded border-2 border-white shadow hover:scale-105 active:scale-95 transition-all uppercase tracking-wider shrink-0"
                        >
                          Panel
                        </button>

                        {/* Refresh indicator inside row */}
                        <button
                          onClick={() => {
                            alert(`${m.name} result updated successfully.`);
                          }}
                          className="absolute bottom-1 right-2 border border-red-500 bg-white text-red-600 text-[8px] font-black uppercase px-1 rounded hover:bg-neutral-100"
                        >
                          Refresh
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guessing Promo card at bottom of live */}
              <div className="max-w-4xl mx-auto rounded-lg border-4 border-red-600 bg-white p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-yellow-100 text-red-600 border border-red-300">
                    <Zap className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neutral-900">🔮 Aaj Ka VIP Game Guesses Chahiye?</h4>
                    <p className="text-xs text-neutral-600 mt-0.5 font-bold">Expert algorithms and cut-ank formulas ke anushar lucky ank nikalen bilkul free!</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('guessing')}
                  className="rounded bg-red-600 border-2 border-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow hover:bg-red-700 transition-all active:scale-95"
                >
                  VIP GUESSING DEKHE
                </button>
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

          {/* TAB 2.5: ADVANCED ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsPanel records={jodiRecords} />
          )}

          {/* TAB 3: VIP GUESSING */}
          {activeTab === 'guessing' && (
            <VipGuessing markets={marketList} />
          )}

          {/* TAB 4: HOW TO PLAY */}
          {activeTab === 'rules' && (
            <RulesInfo />
          )}

        </div>

        {/* ADMIN TAB OVERLAY PANEL */}
        {isAdmin && (
          <div className="mt-12 border-t-4 border-red-600 pt-10">
            <AdminPanel
              markets={markets}
              onUpdateMarkets={handleUpdateMarkets}
              onAddJodiRecord={handleAddJodiRecord}
              onResetData={handleResetData}
              googleVerification={googleVerification}
              onUpdateGoogleVerification={(val) => {
                setGoogleVerification(val);
                localStorage.setItem('satta_google_verification', val);
              }}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t-4 border-red-600 bg-yellow-400 py-10 text-center px-4 shadow-inner">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-red-600 animate-bounce" />
            <span className="text-lg font-black tracking-wider text-neutral-900">
              👑 NEWGOLDANSAGAR
            </span>
          </div>

          <p className="text-[11px] text-neutral-800 max-w-2xl mx-auto leading-relaxed font-bold">
            Newgoldansagar results are purely informative mathematical simulations. We do not support, endorse, or promote any kind of real-money gambling, illegal wagering, or bet placement. This application acts solely as a result compiler dashboard and past-results panel calculator. Please view responsibly.
          </p>

          <div className="pt-2 text-[10px] text-neutral-700 font-extrabold uppercase">
            © 2026 Newgoldansagar Inc. All Rights Reserved. • Fast, Accurate & Royal.
          </div>
        </div>
      </footer>
    </div>
  );
}
