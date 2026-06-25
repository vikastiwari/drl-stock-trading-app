import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PortfolioChart } from './PortfolioChart';
import { AIReasoningPanel } from './AIReasoningPanel';
import { NewsSentimentWidget } from './NewsSentimentWidget';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface DashboardLayoutProps {
  chartDataPoint: any;
  targetWeights: any;
  sentimentPayload?: any;
  pnlStats?: any;
  popoutPanel?: string | null;
}

export function DashboardLayout({ chartDataPoint, targetWeights, sentimentPayload, pnlStats, popoutPanel }: DashboardLayoutProps) {
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const fetchHistory = async () => {
      const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
      const dataMap: any = {};
      for (const ticker of tickers) {
        try {
          const res = await fetch(`http://localhost:8000/api/historical/${ticker}`);
          const json = await res.json();
          dataMap[ticker] = json.data;
        } catch (e) {
          console.error(e);
        }
      }
      setHistoricalData(dataMap);
    };
    fetchHistory();
  }, []);

  const toggleFullscreen = (panel: string) => {
    if (fullscreenPanel === panel) {
      setFullscreenPanel(null);
    } else {
      setFullscreenPanel(panel);
    }
  };

  const openPopout = (panel: string) => {
    window.open(`/?popout=${panel}`, '_blank', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
  };

  const renderPanel = (id: string, title: string, content: React.ReactNode, defaultClass: string) => {
    // If we are in popout mode, ONLY render the specified popoutPanel
    if (popoutPanel) {
      if (popoutPanel !== id) return null;
      return (
        <div className="h-screen w-screen p-4 bg-[var(--bg-dark)] text-white">
          <div className="glass-panel rounded-xl overflow-hidden relative flex flex-col h-full w-full">
            <div className="h-full w-full overflow-y-auto custom-scrollbar">
              {content}
            </div>
          </div>
        </div>
      );
    }

    const isFullscreen = fullscreenPanel === id;
    const isHidden = fullscreenPanel !== null && fullscreenPanel !== id;

    if (isHidden) return null;

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-panel rounded-xl overflow-hidden relative flex flex-col ${isFullscreen ? 'col-span-12 row-span-12 h-[80vh] z-50' : defaultClass}`}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2 bg-[var(--bg-dark)]/50 backdrop-blur-md p-1 rounded-lg border border-[var(--border-subtle)]">
          <button 
            onClick={() => openPopout(id)}
            className="p-1.5 hover:bg-white/10 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
            title="Pop out to new window"
          >
            <ExternalLink size={14} />
          </button>
          <button 
            onClick={() => toggleFullscreen(id)}
            className="p-1.5 hover:bg-white/10 rounded-md text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
        <div className="h-full w-full overflow-y-auto custom-scrollbar">
          {content}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full min-h-[800px] grid grid-cols-12 grid-rows-6 gap-4">
      {renderPanel(
        'chart', 
        'Live Market', 
        <div className="flex flex-col h-full">
          <div className="px-4 pt-4 pb-2 flex justify-between items-end border-b border-[var(--border-subtle)]/30">
            <div>
              <div className="text-sm text-[var(--text-muted)] font-medium mb-1">Portfolio Value &nbsp; | &nbsp; Initial Capital: ${pnlStats?.initial_capital?.toLocaleString() || '100,000'}</div>
              <div className="text-3xl font-bold text-white">
                ${pnlStats?.portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
              </div>
            </div>
            {pnlStats && (
              <div className={`text-lg font-bold mb-1 ${pnlStats.pnl_dollars >= 0 ? 'text-green-400' : 'text-rose-500'}`}>
                {pnlStats.pnl_dollars >= 0 ? '+' : ''}${pnlStats.pnl_dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlStats.pnl_percent >= 0 ? '+' : ''}{pnlStats.pnl_percent}%)
              </div>
            )}
          </div>
          <div className="flex-1 p-4"><PortfolioChart dataPoint={chartDataPoint} /></div>
        </div>, 
        'col-span-12 lg:col-span-8 row-span-3 lg:row-span-4'
      )}
      
      {renderPanel(
        'brain', 
        'AI Logic', 
        <div className="h-full"><AIReasoningPanel targetWeights={targetWeights} /></div>, 
        'col-span-12 md:col-span-6 lg:col-span-4 row-span-3 lg:row-span-4'
      )}
      
      {renderPanel(
        'news', 
        'Sentiment', 
        <div className="h-full"><NewsSentimentWidget payload={sentimentPayload} /></div>, 
        'col-span-12 md:col-span-6 lg:col-span-12 row-span-2'
      )}

      {renderPanel(
        'assets', 
        'Asset Tear Sheet', 
        <div className="h-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {['AAPL', 'MSFT', 'GOOGL', 'AMZN'].map((ticker) => (
            <div key={ticker} className="bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded flex flex-col p-3 hover:border-[var(--accent-cyan)]/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent-cyan)] transition-colors">{ticker}</span>
                <span className="text-xs font-mono font-bold bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] px-2 py-0.5 rounded">
                  Wgt: {targetWeights ? (targetWeights[ticker] * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex-1 min-h-[60px] w-full mt-2 relative">
                {historicalData[ticker] && historicalData[ticker].length > 0 ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <LineChart data={historicalData[ticker]}>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="var(--accent-cyan)" 
                        strokeWidth={2} 
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-end gap-1 opacity-20">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex-1 bg-[var(--accent-cyan)] rounded-t" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>, 
        'col-span-12 row-span-1'
      )}
    </div>
  );
}
