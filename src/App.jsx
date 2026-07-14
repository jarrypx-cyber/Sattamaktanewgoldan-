import { useState } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Sattamaktanewgoldan</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Built with Vite + React and Vercel Speed Insights
        </p>
      </div>
      <SpeedInsights />
    </>
  )
}

export default App
