    import React, { useState, useEffect } from 'react';

function App() {
  // 1. Live results save karne ke liye state variables
  const [results, setResults] = useState({
    new_golden_sagar: "Awaited",
    kalyan: "Awaited",
    time_bazar: "Awaited",
    madhur_day: "Awaited"
  });
  const [loading, setLoading] = useState(true);

  // 2. Render.com ki API se live result automatic fetch karne ka function
  const fetchResults = () => {
    fetch('https://onrender.com')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setResults(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Fetch Error:", err);
        setLoading(false);
      });
  };

  // 3. Website open hote hi aur har 30 seconds mein data refresh karne ke liye
  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000); // 30 seconds automatic refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* Top Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>MATKA ONE</h1>
        <div style={{ backgroundColor: '#FF0000', color: '#FFF', padding: '10px', borderRadius: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          LIVE RESULTS CENTER <br />
          <span style={{ fontSize: '12px', color: '#FFF' }}>FASTEST LIVE UPDATE • 100% SECONDS-LEVEL SYNC</span>
        </div>
      </div>

      {/* Super Fast Flash Banner */}
      <div style={{ backgroundColor: '#FF0000', color: '#FFF', textAlign: 'center', padding: '8px', borderRadius: '5px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>
        ⚡ SUPER FAST LIVE RESULTS ⚡
      </div>

      {/* Main Results Container Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto' }}>
        
        {/* Card 1: NEW GOLDEN SAGAR */}
        <div style={{ backgroundColor: '#FFF000', border: '3px solid #FF0000', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF0000', margin: '0 0 10px 0', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#FF0000', animation: 'blink 1s infinite' }}>●</span> LIVE NEW GOLDEN SAGAR
          </h2>
          <div style={{ backgroundColor: '#006400', color: '#00FF00', fontSize: '32px', fontWeight: 'bold', padding: '10px 20px', borderRadius: '5px', display: 'inline-block', minWidth: '150px' }}>
            {results.new_golden_sagar}
          </div>
          <button onClick={fetchResults} style={{ display: 'block', margin: '10px auto 0 auto', backgroundColor: '#FF0000', color: '#FFF', border: 'none', padding: '5px 15px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>REFRESH</button>
        </div>

        {/* Card 2: KALYAN */}
        <div style={{ backgroundColor: '#FFF000', border: '3px solid #FF0000', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF0000', margin: '0 0 10px 0', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#FF0000' }}>●</span> LIVE KALYAN
          </h2>
          <div style={{ backgroundColor: '#006400', color: '#00FF00', fontSize: '32px', fontWeight: 'bold', padding: '10px 20px', borderRadius: '5px', display: 'inline-block', minWidth: '150px' }}>
            {results.kalyan}
          </div>
          <button onClick={fetchResults} style={{ display: 'block', margin: '10px auto 0 auto', backgroundColor: '#FF0000', color: '#FFF', border: 'none', padding: '5px 15px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>REFRESH</button>
        </div>

        {/* Card 3: TIME BAZAR */}
        <div style={{ backgroundColor: '#FFF000', border: '3px solid #FF0000', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF0000', margin: '0 0 10px 0', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#FF0000' }}>●</span> LIVE TIME BAZAR
          </h2>
          <div style={{ backgroundColor: '#006400', color: '#00FF00', fontSize: '32px', fontWeight: 'bold', padding: '10px 20px', borderRadius: '5px', display: 'inline-block', minWidth: '150px' }}>
            {results.time_bazar}
          </div>
          <button onClick={fetchResults} style={{ display: 'block', margin: '10px auto 0 auto', backgroundColor: '#FF0000', color: '#FFF', border: 'none', padding: '5px 15px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>REFRESH</button>
        </div>

        {/* Card 4: MADHUR DAY */}
        <div style={{ backgroundColor: '#FFF000', border: '3px solid #FF0000', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
          <h2 style={{ color: '#FF0000', margin: '0 0 10px 0', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#FF0000' }}>●</span> LIVE MADHUR DAY
          </h2>
          <div style={{ backgroundColor: '#006400', color: '#00FF00', fontSize: '32px', fontWeight: 'bold', padding: '10px 20px', borderRadius: '5px', display: 'inline-block', minWidth: '150px' }}>
            {results.madhur_day}
          </div>
          <button onClick={fetchResults} style={{ display: 'block', margin: '10px auto 0 auto', backgroundColor: '#FF0000', color: '#FFF', border: 'none', padding: '5px 15px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}>REFRESH</button>
        </div>

      </div>
    </div>
  );
}

export default App;
