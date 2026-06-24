import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { PortfolioChart } from './components/PortfolioChart';
import { AIReasoningPanel } from './components/AIReasoningPanel';

interface PortfolioData {
  portfolio_value: number;
  target_weights: { [key: string]: number };
}

function App() {
  const [targetWeights, setTargetWeights] = useState<{ [key: string]: number } | null>(null);
  const [chartDataPoint, setChartDataPoint] = useState<{ time: number; value: number } | null>(null);

  useEffect(() => {
    // Connect to Litestar Server-Sent Events endpoint
    const eventSource = new EventSource('/api/stream/portfolio');
    
    eventSource.onmessage = (event) => {
      const data: PortfolioData = JSON.parse(event.data);
      
      setTargetWeights(data.target_weights);
      
      // TradingView requires Unix timestamp as a NUMBER, not a string
      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      setChartDataPoint({
        time: currentTimeSeconds,
        value: data.portfolio_value
      });
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30 font-sans pb-12">
      {/* Top Navigation */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
              Retail AI Trader
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SSE LIVE
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <PortfolioChart dataPoint={chartDataPoint} />
          </div>
          
          {/* AI Side Panel */}
          <div className="lg:col-span-1">
            <AIReasoningPanel targetWeights={targetWeights} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
