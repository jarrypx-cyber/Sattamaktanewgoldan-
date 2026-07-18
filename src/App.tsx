import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Admin State Management
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      const { data, error } = await supabase.from('markets').select('*');
      if (!error && data) {
        setMarkets(data);
      }
      setLoading(false);
    };

    fetchMarkets();

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarket) return;

    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const { error } = await supabase
      .from('markets')
      .update({
        openPana: editingMarket.openPana,
        openSingle: editingMarket.openSingle,
        closeSingle: editingMarket.closeSingle,
        closePana: editingMarket.closePana,
        status: editingMarket.status,
        lastUpdated: currentTime
      })
      .eq('id', editingMarket.id);

    if (!error) {
      alert(`${editingMarket.name} Updated!`);
      setEditingMarket(null);
      const { data } = await supabase.from('markets').select('*');
      if (data) setMarkets(data);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#0f172a', color: 'white', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <h2>Loading Live Results...</h2>
      </div>
    );
  }

  // ================= ADMIN VIEW =================
  if (currentPath === '/admin') {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '15px' }}>
        <div style={{ textAlign: 'center', padding: '15px 0', borderBottom: '2px solid #ef4444', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#ef4444', fontSize: '26px' }}>🔑 SECRET ADMIN PANEL</h1>
        </div>

        {editingMarket && (
          <div style={{ background: '#1e293b', border: '2px solid #ef4444', borderRadius: '12px', padding: '15px', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#ef4444' }}>Editing: {editingMarket.name}</h3>
            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '10px' }}>
              <input type="text" placeholder="Open Pana" value={editingMarket.openPana} onChange={(e) => setEditingMarket({...editingMarket, openPana: e.target.value})} style={{ padding: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px' }} />
              <input type="text" placeholder="Open Single" value={editingMarket.openSingle} onChange={(e) => setEditingMarket({...editingMarket, openSingle: e.target.value})} style={{ padding: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px' }} />
              <input type="text" placeholder="Close Single" value={editingMarket.closeSingle} onChange={(e) => setEditingMarket({...editingMarket, closeSingle: e.target.value})} style={{ padding: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px' }} />
              <input type="text" placeholder="Close Pana" value={editingMarket.closePana} onChange={(e) => setEditingMarket({...editingMarket, closePana: e.target.value})} style={{ padding: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px' }} />
              <select value={editingMarket.status} onChange={(e) => setEditingMarket({...editingMarket, status: e.target.value})} style={{ padding: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px' }}>
                <option value="LIVE">LIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ef4444', padding: '10px', borderRadius: '6px', fontWeight: 'bold', border: 'none', color: 'white' }}>SAVE</button>
                <button type="button" onClick={() => setEditingMarket(null)} style={{ background: '#475569', padding: '10px', borderRadius: '6px', border: 'none', color: 'white' }}>CANCEL</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
          {markets.map((market) => (
            <div key={market.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
              <div>
                <h4 style={{ margin: 0 }}>{market.name}</h4>
                <span style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 'bold' }}>{market.openPana}-{market.openSingle}{market.closeSingle}-{market.closePana}</span>
              </div>
              <button onClick={() => setEditingMarket({...market})} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>EDIT</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= PUBLIC USER VIEW =================
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '15px' }}>
      <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #3b82f6', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}>MATKA LIVE RESULT</h1>
      </div>

      <div style={{ display: 'grid', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
        {markets.map((market) => (
          <div key={market.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '15px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>{market.name}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Open: {market.openTime} | Close: {market.closeTime}</span>
              </div>
              <span style={{ background: market.status === 'LIVE' ? '#22c55e' : '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                {market.status}
              </span>
            </div>

            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '15px', textAlign: 'center', margin: '10px 0' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px', color: '#e2e8f0' }}>
                {market.openPana}-{market.openSingle}{market.closeSingle}-{market.closePana}
              </div>
            </div>

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
