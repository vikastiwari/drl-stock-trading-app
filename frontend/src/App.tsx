import { useState, useEffect, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { GlobalModal } from './components/GlobalModal';
import { StoreProvider, useStore } from './store';
import { DashboardLayout } from './components/DashboardLayout';
import { useCrossTabState } from './hooks/useCrossTabState';
import TerminalCLI from './components/TerminalCLI';
import BacktestModal from './components/BacktestModal';

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
    committee?: {
      fundamental: { score: number; reasoning: string };
      technical: { score: number; reasoning: string };
      macro: { score: number; reasoning: string };
    };
  };
  execution_logs?: string[];
}

function AppContent() {
  const isPopout = window.location.search.includes('popout=');
  const popoutPanel = new URLSearchParams(window.location.search).get('popout');

  // Use the new BroadcastChannel hook to sync state across tabs instantly
  const [terminalState, setTerminalState] = useCrossTabState<TerminalState | null>('drl-terminal-state', null);
  const [chartDataPoint, setChartDataPoint] = useCrossTabState<{ time: number; value: number } | null>('drl-chart-data', null);
  const [activeBacktestTicker, setActiveBacktestTicker] = useState<string | null>(null);
  const { apiKeys } = useStore();

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // If this is a detached pop-out window, do NOT connect to the WebSocket.
    // It will receive all updates instantly via BroadcastChannel from the Main window.
    if (isPopout) return;

    // Connect to the Bidirectional WebSocket ONLY in the main window
    const ws = new WebSocket('ws://localhost:8000/ws/terminal-feed');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Institutional Terminal Feed');
      ws.send(JSON.stringify({ target_asset: 'AAPL', apiKeys }));
    };

    ws.onmessage = (event) => {
      const data: TerminalState = JSON.parse(event.data);
      
      if (data.event_type === 'TERMINAL_STATE_UPDATE') {
        // Broadcast the full state to any pop-out tabs
        setTerminalState(data);
        
        const currentTimeSeconds = Math.floor(Date.now() / 1000);
        // Broadcast chart data points
        setChartDataPoint({
          time: currentTimeSeconds,
          value: data.portfolio_value
        });
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [isPopout, apiKeys.autoTradeEnabled]);

  return (
    <div className="min-h-screen p-6 relative overflow-x-hidden overflow-y-auto font-sans pb-12 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/30 blur-[120px] pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none fixed"></div>

      <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col gap-6 min-h-screen">
        {!isPopout && <TopNav />}
        <div className="flex-1 h-full min-h-[800px]">
          <DashboardLayout 
            chartDataPoint={chartDataPoint} 
            targetWeights={terminalState?.portfolio_allocations || null} 
            sentimentPayload={terminalState?.asset_sentiment || null} 
            pnlStats={terminalState ? {
              initial_capital: terminalState.initial_capital,
              pnl_dollars: terminalState.pnl_dollars,
              pnl_percent: terminalState.pnl_percent,
              portfolio_value: terminalState.portfolio_value
            } : null}
            popoutPanel={popoutPanel}
          />
          {!isPopout && (
            <TerminalCLI 
              executionLogs={terminalState?.execution_logs}
              onCommand={(cmd, args) => {
                if (cmd === '/backtest' && args.length > 0) {
                  setActiveBacktestTicker(args[0].toUpperCase());
                }
              }} 
            />
          )}
        </div>
      </div>
      
      {activeBacktestTicker && (
        <BacktestModal 
          ticker={activeBacktestTicker} 
          onClose={() => setActiveBacktestTicker(null)} 
        />
      )}
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
