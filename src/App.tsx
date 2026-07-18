import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Connection Setup
const SUPABASE_URL = "https://lwkdudqnbwxlnmkudpq.supabase.co";
const SUPABASE_KEY = "Sb_publishable_GFMh9Pa3nHXmCojo1AWZzA_BRLTTRQs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Market {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  openPana: string;
  openSingle: string;
  closeSingle: string;
  closePana: string;
  status: string;
  lastUpdated: string;
}

function App() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime Data Fetching
  useEffect(() => {
    const fetchMarkets = async () => {
      const { data, error } = await supabase.from('markets').select('*');
      if (!error && data) {
        setMarkets(data);
      }
      setLoading(false);
    };

    fetchMarkets();

    // Live Listeners for Instant Update (1 Second Updates!)
    const subscription = supabase
      .channel('public:markets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'markets' }, (payload) => {
        setMarkets((prev) =>
          prev.map((m) => (m.id === payload.new.id ? (payload.new as Market) : m))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#0f172a', color: 'white', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <h2>Loading Live Results...</h2>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '15px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #3b82f6', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}>MATKA LIVE RESULT</h1>
        <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Fastest Manual Live Updates India</p>
      </div>

      {/* Market Cards Container */}
      <div style={{ display: 'grid', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
        {markets.map((market) => (
          <div key={market.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #334155' }}>
            
            {/* Market Title & Times */}
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>{market.name}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Open: {market.openTime} | Close: {market.closeTime}</span>
              </div>
              <span style={{ background: market.status === 'LIVE' ? '#22c55e' : '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                {market.status}
              </span>
            </div>

            {/* Results Display */}
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '15px', textAlign: 'center', margin: '10px 0' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px', color: '#e2e8f0' }}>
                {market.openPana}-{market.openSingle}{market.closeSingle}-{market.closePana}
              </div>
            </div>

            {/* Footer Update Time */}
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
              Updated: {market.lastUpdated}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
