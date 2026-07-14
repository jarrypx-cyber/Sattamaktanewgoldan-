import React, { useState, useEffect } from 'react';

// Mock Data for Satta Markets
const defaultMarkets = [
  { id: 'new-golden-sagar', name: 'NEW GOLDEN SAGAR', openPana: '123', openSingle: '6', closeSingle: '5', closePana: '456', openTime: '11:00 AM', closeTime: '12:00 PM' },
  { id: 'kalyan', name: 'KALYAN', openPana: '234', openSingle: '9', closeSingle: '0', closePana: '789', openTime: '04:00 PM', closeTime: '06:00 PM' },
  { id: 'main-bazar', name: 'MAIN BAZAR', openPana: '345', openSingle: '2', closeSingle: '1', closePana: '890', openTime: '09:30 PM', closeTime: '12:00 AM' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [markets, setMarkets] = useState(defaultMarkets);

  return (
    <div className="min-h-screen w-full bg-[#ccff33] font-sans text-neutral-900 antialiased pb-10">
      {/* Header */}
      <header className="bg-red-600 text-white text-center py-4 shadow-md border-b-4 border-black">
        <h1 className="text-3xl font-black tracking-wider">👑 NEW GOLDEN SAGAR 👑</h1>
        <p className="text-xs font-bold mt-1 text-yellow-300">FASTEST SATTA MATKA LIVE RESULTS</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center bg-yellow-400 border-b-4 border-red-600 font-bold">
        <button onClick={() => setActiveTab('live')} className={`px-6 py-3 text-sm uppercase tracking-wider ${activeTab === 'live' ? 'bg-red-600 text-white' : 'text-neutral-900'}`}>🔴 Live Result</button>
        <button onClick={() => setActiveTab('guessing')} className={`px-6 py-3 text-sm uppercase tracking-wider ${activeTab === 'guessing' ? 'bg-red-600 text-white' : 'text-neutral-900'}`}>🔮 VIP Guessing</button>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Golden Ank Card */}
            <div className="rounded-lg border-4 border-red-600 bg-white shadow-lg overflow-hidden text-center">
              <div className="bg-[#008080] text-yellow-300 px-4 py-2 text-base font-black uppercase">
                TODAY GOLDEN ANK ({new Date().toLocaleDateString('en-GB')})
              </div>
              <div className="py-6 text-4xl sm:text-5xl font-mono font-black text-blue-700 tracking-wider">
                1 - 6 - 0 - 5
              </div>
              <div className="bg-red-600 text-yellow-300 text-xs font-black py-1.5 tracking-widest animate-pulse">
                ⚡ FAST LIVE RESULTS ⚡
              </div>
            </div>

            {/* Results Table */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-center text-red-600 uppercase">📊 LIVE RESULTS TIMING BOARDS 📊</h3>
              {markets.map((m) => (
                <div key={m.id} className="bg-[#ffff00] border-4 border-red-600 rounded-lg p-4 flex items-center justify-between shadow-md">
                  <div className="text-center w-full">
                    <h4 className="text-xl font-black text-blue-800 uppercase">{m.name}</h4>
                    <div className="my-2 text-2xl font-black text-black font-mono tracking-wider">
                      {m.openPana}-{m.openSingle}{m.closeSingle}-{m.closePana}
                    </div>
                    <div className="text-[10px] font-black text-neutral-600 uppercase">
                      ({m.openTime} to {m.closeTime})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guessing' && (
          <div className="bg-white border-4 border-red-600 rounded-lg p-6 text-center shadow-lg">
            <h3 className="text-2xl font-black text-red-600 uppercase mb-4">🔮 VIP GUESSING ZONE 🔮</h3>
            <p className="text-sm font-bold text-neutral-700">Expert formula aur lucky ank nikalne ke liye thoda intezar karein. VIP ank jald hi update kiye jayenge!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t-4 border-red-600 bg-yellow-400 py-6 text-center px-4">
        <p className="text-[10px] text-neutral-800 max-w-2xl mx-auto font-bold leading-relaxed">
          Disclaimer: This website is purely for mathematical simulation and informational purposes. We do not support or promote illegal gambling or wagering.
        </p>
        <div className="pt-2 text-[10px] text-neutral-700 font-black">© 2026 Newgoldansagar Inc. All Rights Reserved.</div>
      </footer>
    </div>
  );
}
