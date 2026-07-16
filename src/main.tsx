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
      
      if (json) {
        setLiveData(json);
      }
      setLoading(false);
    } catch (error) {
      console.error('लाइव डेटा अपडेट करने में एरर आया:', error);
    }
  };

  useEffect(() => {
    fetchLiveResults();
    // हर 1 मिनट में खुद ऑटो-अपडेट होगा
    const interval = setInterval(fetchLiveResults, 60000);
    return () => clearInterval(interval);
  }, []);

  // किसी भी बाज़ार का नंबर निकालने का सुरक्षित फंक्शन
  const getMarketResult = (marketName: string) => {
    if (loading || !liveData) return "Awaited";
    return liveData[marketName] || "Awaited";
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchLiveResults();
  };

  // बाज़ारों की लिस्ट जो वेबसाइट पर दिखानी है
  const markets = [
    { id: "new_golden_sagar", displayName: "NEW GOLDEN SAGAR", apiKey: "New Golden Sagar" },
    { id: "kalyan", displayName: "KALYAN", apiKey: "Kalyan" },
    { id: "time_bazar", displayName: "TIME BAZAR", apiKey: "Time Bazar" },
    { id: "madhur_day", displayName: "MADHUR DAY", apiKey: "Madhur Day" },
    { id: "bombay_day", displayName: "BOMBAY DAY", apiKey: "Bombay Day" },
    { id: "golden_night", displayName: "GOLDEN NIGHT", apiKey: "Golden Night" },
    { id: "rajdhani_night", displayName: "RAJDHANI NIGHT", apiKey: "Rajdhani Night" }
  ];

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '10px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ backgroundColor: '#fffb00', color: '#000', textAlign: 'center', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' }}>MATKAONE</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#ff0000' }}>
          LIVE RESULTS CENTER
        </p>
        <p style={{ margin: '3px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#008000' }}>
          FASTEST LIVE UPDATE • 100% SECONDS-LEVEL SYNC
        </p>
      </div>

      {/* SUPER FAST LIVE RESULTS SECTION */}
      <div style={{ backgroundColor: '#ff0000', color: '#fffb00', textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', borderRadius: '5px', marginBottom: '15px' }}>
        ⚡ SUPER FAST LIVE RESULTS ⚡
      </div>

      {/* सभी गेम्स के लाइव बॉक्स (यहाँ लूप लगा दिया है जिससे सारे नाम आ जाएँगे) */}
      {markets.map((market) => (
        <div key={market.id} style={{ backgroundColor: '#fffb00', color: '#000', borderRadius: '8px', padding: '15px', textAlign: 'center', marginBottom: '15px', border: '2px solid #ff0000' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 'bold', color: 'red', fontSize: '14px' }}>LIVE</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>{market.displayName}</span>
          </div>
          
          {/* लाइव नंबर यहाँ ऑटो-अपडेट होगा */}
          <div style={{ backgroundColor: '#004d00', color: '#00ff00', fontSize: '28px', fontWeight: 'bold', padding: '10px', borderRadius: '5px', letterSpacing: '2px', display: 'inline-block', minWidth: '200px', margin: '10px 0' }}>
            {getMarketResult(market.apiKey)}
          </div>

          <div>
            <button onClick={handleManualRefresh} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
              REFRESH
            </button>
          </div>
        </div>
      ))}

      {/* WEEKLY NAVIGATION BUTTONS */}
      <div style={{ backgroundColor: '#fffb00', padding: '10px', borderRadius: '8px', textAlign: 'center', marginTop: '20px' }}>
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
