import { useState, useEffect, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { GlobalModal } from './components/GlobalModal';
import { StoreProvider } from './store';
import { DashboardLayout } from './components/DashboardLayout';

interface TerminalState {
  event_type: string;
  initial_capital: number;
  portfolio_value: number;
  pnl_dollars: number;
  pnl_percent: number;
  portfolio_allocations: { [key: string]: number };
  asset_sentiment: {
    score: number;
    reasoning: string;
    headlines: string[];
  };
}

function AppContent() {
  const [targetWeights, setTargetWeights] = useState<{ [key: string]: number } | null>(null);
  const [chartDataPoint, setChartDataPoint] = useState<{ time: number; value: number } | null>(null);
  const [sentimentPayload, setSentimentPayload] = useState<any>(null);
  const [pnlStats, setPnlStats] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to the new Bidirectional WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/terminal-feed');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Institutional Terminal Feed');
      // Send the initial configuration payload
      ws.send(JSON.stringify({ target_asset: 'AAPL' }));
    };

    ws.onmessage = (event) => {
      const data: TerminalState = JSON.parse(event.data);
      
      if (data.event_type === 'TERMINAL_STATE_UPDATE') {
        setTargetWeights(data.portfolio_allocations);
        setSentimentPayload(data.asset_sentiment);
        setPnlStats({
          initial_capital: data.initial_capital,
          pnl_dollars: data.pnl_dollars,
          pnl_percent: data.pnl_percent,
          portfolio_value: data.portfolio_value
        });
        
        const currentTimeSeconds = Math.floor(Date.now() / 1000);
        setChartDataPoint({
          time: currentTimeSeconds,
          value: data.portfolio_value
        });
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-6 relative overflow-hidden font-sans pb-12 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col gap-6">
        <TopNav />
        <div className="flex-1 min-h-[800px]">
          <DashboardLayout 
            chartDataPoint={chartDataPoint} 
            targetWeights={targetWeights} 
            sentimentPayload={sentimentPayload} 
            pnlStats={pnlStats}
          />
        </div>
      </div>
      
      <GlobalModal />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
