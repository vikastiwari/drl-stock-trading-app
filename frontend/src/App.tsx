import { useState, useEffect } from 'react';
import { PortfolioChart } from './components/PortfolioChart';
import { AIReasoningPanel } from './components/AIReasoningPanel';
import { TopNav } from './components/TopNav';
import { GlobalModal } from './components/GlobalModal';
import { StoreProvider } from './store';

interface PortfolioData {
  portfolio_value: number;
  target_weights: { [key: string]: number };
}

function AppContent() {
  const [targetWeights, setTargetWeights] = useState<{ [key: string]: number } | null>(null);
  const [chartDataPoint, setChartDataPoint] = useState<{ time: number; value: number } | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream/portfolio');
    
    eventSource.onmessage = (event) => {
      const data: PortfolioData = JSON.parse(event.data);
      setTargetWeights(data.target_weights);
      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      setChartDataPoint({
        time: currentTimeSeconds,
        value: data.portfolio_value
      });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen p-6 relative overflow-hidden font-sans pb-12 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <TopNav />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart dataPoint={chartDataPoint} />
          </div>
          <div className="lg:col-span-1">
            <AIReasoningPanel targetWeights={targetWeights} />
          </div>
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
