import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // RapidAPI से सीधे लाइव रिजल्ट खींचने का ऑटोमैटिक फंक्शन
  const fetchLiveResults = async () => {
    try {
      const response = await fetch(
        'https://rapidapi.com',
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'ea3eb38e34msh200b51b3f6c8854p15d85cjsn8159ea3ea9ec',
            'x-rapidapi-host': '://rapidapi.com'
          }
        }
      );
      const json = await response.json();
      
      // अगर API से सही डेटा मिला है तो उसे स्टेट में सेव करें
      if (json) {
        setLiveData(json);
      }
      setLoading(false);
    } catch (error) {
      console.error('लाइव डेटा अपडेट करने में एरर आया:', error);
    }
  };

  useEffect(() => {
    // वेबसाइट खुलते ही तुरंत पहली बार डेटा लोड होगा
    fetchLiveResults();

    // हर 1 मिनट (60,000 मिलीसेकंड) में बैकग्राउंड में खुद डेटा अपडेट होता रहेगा
    const interval = setInterval(fetchLiveResults, 60000);
    return () => clearInterval(interval);
  }, []);

  // किसी भी बाज़ार का नंबर निकालने का सुरक्षित फंक्शन
  const getMarketResult = (marketName: string) => {
    if (loading || !liveData) return "Awaited";
    return liveData[marketName] || "Awaited";
  };

  // 'Refresh' बटन दबाने पर तुरंत मैन्युअल अपडेट करने के लिए
  const handleManualRefresh = () => {
    setLoading(true);
    fetchLiveResults();
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '10px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ backgroundColor: '#fffb00', color: '#000', textAlign: 'center', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' }}>MATKAONE</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#ff0000' }}>
          KALYAN RESULT | NEW GOLDEN DAY
        </p>
        <p style={{ margin: '3px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#008000' }}>
          FASTEST LIVE UPDATE • 100% SECONDS-LEVEL SYNC
        </p>
      </div>

      {/* SUPER FAST LIVE RESULTS SECTION */}
      <div style={{ backgroundColor: '#ff0000', color: '#fffb00', textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', borderRadius: '5px', marginBottom: '15px' }}>
        ⚡ SUPER FAST LIVE RESULTS ⚡
      </div>

      {/* 1. NEW GOLDEN SAGAR BOX */}
      <div style={{ backgroundColor: '#fffb00', color: '#000', borderRadius: '8px', padding: '15px', textAlign: 'center', marginBottom: '15px', border: '2px solid #ff0000' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 'bold', color: 'red', fontSize: '14px' }}>LIVE</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>NEW GOLDEN SAGAR</span>
        </div>
        
        {/* लाइव नंबर यहाँ ऑटो-अपडेट होगा */}
        <div style={{ backgroundColor: '#004d00', color: '#00ff00', fontSize: '28px', fontWeight: 'bold', padding: '10px', borderRadius: '5px', letterSpacing: '2px', display: 'inline-block', minWidth: '200px', margin: '10px 0' }}>
          {getMarketResult("New Golden Sagar")}
        </div>

        <div>
          <button onClick={handleManualRefresh} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
            REFRESH
          </button>
        </div>
      </div>

      {/* 2. KALYAN BOX */}
      <div style={{ backgroundColor: '#fffb00', color: '#000', borderRadius: '8px', padding: '15px', textAlign: 'center', marginBottom: '15px', border: '2px solid #ff0000' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 'bold', color: 'red', fontSize: '14px' }}>LIVE</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>KALYAN</span>
        </div>
        
        {/* लाइव नंबर यहाँ ऑटो-अपडेट होगा */}
        <div style={{ backgroundColor: '#004d00', color: '#00ff00', fontSize: '28px', fontWeight: 'bold', padding: '10px', borderRadius: '5px', letterSpacing: '2px', display: 'inline-block', minWidth: '200px', margin: '10px 0' }}>
          {getMarketResult("Kalyan")}
        </div>

        <div>
          <button onClick={handleManualRefresh} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
            REFRESH
          </button>
        </div>
      </div>

      {/* WEEKLY NAVIGATION BUTTONS */}
      <div style={{ backgroundColor: '#fffb00', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ color: 'red', fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '12px' }}>👑 WEEKLY / JODI CHARTS QUICK NAVIGATION 👑</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button style={{ backgroundColor: '#000', color: '#fffb00', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>KALYAN CHART</button>
          <button style={{ backgroundColor: '#000', color: '#fffb00', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>RAJDHANI NIGHT</button>
          <button style={{ backgroundColor: '#000', color: '#fffb00', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>NEW GOLDEN DAY</button>
          <button style={{ backgroundColor: '#000', color: '#fffb00', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>MILAN DAY</button>
        </div>
      </div>

    </div>
  );
}

// React को HTML के Root Element से जोड़ने के लिए
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
