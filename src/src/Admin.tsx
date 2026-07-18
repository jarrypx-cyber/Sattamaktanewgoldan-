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

function Admin() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const { data, error } = await supabase.from('markets').select('*');
    if (!error && data) {
      setMarkets(data);
    }
    setLoading(false);
  };

  const handleEditClick = (market: Market) => {
    setEditingMarket({ ...market });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingMarket) {
      setEditingMarket({
        ...editingMarket,
        [e.target.name]: e.target.value
      });
    }
  };

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
      alert(`${editingMarket.name} Data Updated Successfully!`);
      setEditingMarket(null);
      fetchMarkets();
    } else {
      alert("Error updating data: " + error.message);
    }
  };

  if (loading) {
    return <div style={{ background: '#0f172a', color: 'white', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading Admin Dashboard...</h2></div>;
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '15px' }}>
      <div style={{ textAlign: 'center', padding: '15px 0', borderBottom: '2px solid #ef4444', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#ef4444', fontSize: '26px' }}>🔑 SECRET ADMIN PANEL</h1>
        <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Update Live Results Instantly</p>
      </div>

      {editingMarket && (
        <div style={{ background: '#1e293b', border: '2px solid #ef4444', borderRadius: '12px', padding: '15px', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ef4444' }}>Editing: {editingMarket.name}</h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Open Pana (e.g., 123)</label>
              <input type="text" name="openPana" value={editingMarket.openPana} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Open Single (e.g., 6)</label>
              <input type="text" name="openSingle" value={editingMarket.openSingle} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Close Single (e.g., 4)</label>
              <input type="text" name="closeSingle" value={editingMarket.closeSingle} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Close Pana (e.g., 456)</label>
              <input type="text" name="closePana" value={editingMarket.closePana} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>Market Status</label>
              <select name="status" value={editingMarket.status} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', marginTop: '4px' }}>
                <option value="LIVE">LIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE CHANGES</button>
              <button type="button" onClick={() => setEditingMarket(null)} style={{ background: '#475569', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>CANCEL</button>
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
            <button onClick={() => handleEditClick(market)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>EDIT</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
