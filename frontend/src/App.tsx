import { useState, useEffect } from 'react'

function App() {
  const [portfolio, setPortfolio] = useState<any>(null)

  useEffect(() => {
    // Connect to Litestar Server-Sent Events endpoint
    const eventSource = new EventSource('/api/stream/portfolio')
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPortfolio(data)
    }

    return () => eventSource.close()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        Retail AI Trader
      </h1>
      
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 max-w-xl">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Live Portfolio State</h2>
        {portfolio ? (
          <div>
            <p className="text-4xl font-mono text-emerald-400 mb-6">
              ${portfolio.portfolio_value.toLocaleString()}
            </p>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Target Allocations
            </h3>
            <div className="space-y-3">
              {Object.entries(portfolio.target_weights).map(([asset, weight]: [string, any]) => (
                <div key={asset} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-300">{asset}</span>
                  <span className="font-mono text-blue-400">{(weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 animate-pulse">Waiting for AI Inference Stream...</p>
        )}
      </div>
    </div>
  )
}

export default App
