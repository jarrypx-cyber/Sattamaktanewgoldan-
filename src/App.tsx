import { useState } from 'react';

interface MarketResult {
  id: number;
  market: string;
  result: string;
  time: string;
}

export default function App() {
  const [results] = useState<MarketResult[]>([
    { id: 1, market: "GALI", result: "75", time: "11:50 PM" },
    { id: 2, market: "DISAWAR", result: "42", time: "05:15 AM" },
    { id: 3, market: "GAZIABAD", result: "89", time: "08:30 PM" },
    { id: 4, market: "FARIDABAD", result: "12", time: "06:15 PM" }
  ]);

  return (
    <div style={{
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#ffcc00', fontSize: '28px', margin: '0' }}>Sattamaktanewgoldan</h1>
        <p style={{ color: '#aaa', fontSize: '14px' }}>Live Fast Results & Charts</p>
      </header>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ background: '#222', padding: '10px', borderRadius: '5px', fontSize: '18px' }}>
          Today's Live Results
        </h2>
        
        {results.map((item) => (
          <div key={item.id} style={{
            background: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: 'bold', display: 'block', fontSize: '16px' }}>{item.market}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Time: {item.time}</span>
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#00ffcc',
              background: '#292929',
              padding: '5px 15px',
              borderRadius: '5px'
            }}>
              {item.result}
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '40px', fontSize: '12px', color: '#666' }}>
        &copy; 2026 Sattamaktanewgoldan. All Rights Reserved.
      </footer>
    </div>
  );
}
