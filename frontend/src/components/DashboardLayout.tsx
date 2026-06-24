import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PortfolioChart } from './PortfolioChart';
import { AIReasoningPanel } from './AIReasoningPanel';
import { NewsSentimentWidget } from './NewsSentimentWidget';
import { Maximize2, Minimize2 } from 'lucide-react';

interface DashboardLayoutProps {
  chartDataPoint: any;
  targetWeights: any;
  sentimentPayload?: any;
}

export function DashboardLayout({ chartDataPoint, targetWeights, sentimentPayload }: DashboardLayoutProps) {
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);

  const toggleFullscreen = (panel: string) => {
    if (fullscreenPanel === panel) {
      setFullscreenPanel(null);
    } else {
      setFullscreenPanel(panel);
    }
  };

  const renderPanel = (id: string, title: string, content: React.ReactNode, defaultClass: string) => {
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
        <div className="p-4 h-full"><PortfolioChart dataPoint={chartDataPoint} /></div>, 
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
            <div key={ticker} className="bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded flex flex-col p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[var(--text-main)]">{ticker}</span>
                <span className="text-xs text-[var(--accent-purple)]">
                  Wgt: {targetWeights ? (targetWeights[ticker] * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-12 flex items-end gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-[var(--accent-cyan)] opacity-50 rounded-t"
                      style={{ height: `${20 + Math.random() * 80}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>, 
        'col-span-12 row-span-1'
      )}
    </div>
  );
}
