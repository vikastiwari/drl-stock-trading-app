import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  timestamp: string;
  sentiment_score: number;
  ai_analysis: string;
}

interface NewsSentimentWidgetProps {
  payload?: {
    score: number;
    reasoning: string;
    headlines: string[];
  };
}

export function NewsSentimentWidget({ payload }: NewsSentimentWidgetProps) {
  const avgSentiment = payload?.score || 0;
  const headlines = payload?.headlines || [];

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <TrendingUp className="text-emerald-400" size={16} />;
    if (score < -0.3) return <TrendingDown className="text-pink-500" size={16} />;
    return <Minus className="text-slate-400" size={16} />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (score < -0.3) return 'text-pink-500 bg-pink-500/10 border-pink-500/30';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  };

  return (
    <div className="w-full h-full bg-[var(--bg-card)] p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-main)]">Live News Sentiment</h3>
            <p className="text-xs text-[var(--text-muted)]">Gemini 2.5 Flash Lite Analysis</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getSentimentColor(avgSentiment)}`}>
          {getSentimentIcon(avgSentiment)}
          <span className="font-bold">Agg: {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100%-80px)] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {headlines.map((headline: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs text-[var(--accent-cyan)] font-mono">Real-Time Source</span>
                <div className={`px-2 py-0.5 rounded text-xs border ${getSentimentColor(avgSentiment)}`}>
                  {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                </div>
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-main)] leading-snug">{headline}</h4>
              {idx === 0 && (
                <p className="text-xs text-[var(--text-muted)] italic border-l-2 border-[var(--border-active)] pl-2">
                  " {payload?.reasoning} "
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
