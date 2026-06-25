import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface BacktestModalProps {
  ticker: string;
  onClose: () => void;
}

interface BacktestDataPoint {
  date: string;
  price: number;
  ppo_value: number;
  bnh_value: number;
}

export default function BacktestModal({ ticker, onClose }: BacktestModalProps) {
  const [data, setData] = useState<BacktestDataPoint[]>([]);
  const [status, setStatus] = useState<string>("Initializing...");
  const [stats, setStats] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to websocket
    const ws = new WebSocket('ws://localhost:8000/ws/backtest');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ ticker, period: '1y' }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'status') {
        setStatus(msg.message);
        if (msg.final_stats) {
          setStats(msg.final_stats);
        }
      } else if (msg.type === 'backtest_step') {
        setData(prev => [...prev, msg.data]);
      } else if (msg.type === 'error') {
        setStatus(`Error: ${msg.message}`);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [ticker]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--bg-main)] border border-[var(--border-subtle)] w-[800px] h-[600px] rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-[var(--accent-purple)]/10"
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-dark)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">PPO Backtest Engine</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Running simulation on {ticker}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex justify-between items-center">
          <div className="font-mono text-sm text-[var(--accent-cyan)]">{status}</div>
          {stats && (
            <div className="flex gap-6 font-mono text-sm">
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">PPO Return</span>
                <span className={stats.ppo_return >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {stats.ppo_return}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-muted)]">Buy & Hold Return</span>
                <span className={stats.bnh_return >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {stats.bnh_return}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-muted)" 
                tick={{fill: 'var(--text-muted)', fontSize: 12}} 
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                tick={{fill: 'var(--text-muted)', fontSize: 12}} 
                domain={['auto', 'auto']}
                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              <Line 
                type="monotone" 
                dataKey="ppo_value" 
                name="AI Agent (PPO)"
                stroke="var(--accent-purple)" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="bnh_value" 
                name="Buy & Hold (S&P 500)"
                stroke="var(--accent-cyan)" 
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
