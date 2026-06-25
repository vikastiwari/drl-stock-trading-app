import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TerminalCLIProps {
  onCommand: (command: string, args: string[]) => void;
  executionLogs?: string[];
}

export default function TerminalCLI({ onCommand, executionLogs }: TerminalCLIProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['> System initialized.', '> Ready for commands.']);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (executionLogs && executionLogs.length > 0) {
      setHistory(prev => {
        const newLogs = executionLogs.filter(log => !prev.includes(log));
        if (newLogs.length > 0) return [...prev, ...newLogs];
        return prev;
      });
    }
  }, [executionLogs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim();
      setHistory(prev => [...prev, `> ${cmd}`]);
      
      const parts = cmd.split(' ');
      const action = parts[0];
      const args = parts.slice(1);
      
      if (action.startsWith('/')) {
        onCommand(action, args);
      } else {
        setHistory(prev => [...prev, `Error: Unknown command. Use /backtest [TICKER]`]);
      }
      setInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, height: isMinimized ? 40 : isMaximized ? 600 : 192 }}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col font-mono text-xs overflow-hidden mt-4 shadow-lg shadow-[var(--accent-cyan)]/5 transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-2 border-b border-[var(--border-subtle)] pb-2 shrink-0">
        <span className="text-[var(--text-muted)] tracking-wider">INSTITUTIONAL TERMINAL CLI</span>
        <div className="flex gap-2">
          <button onClick={() => { setIsMinimized(!isMinimized); setIsMaximized(false); }} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer flex items-center justify-center group" title="Minimize">
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black">-</span>
          </button>
          <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-default"></button>
          <button onClick={() => { setIsMaximized(!isMaximized); setIsMinimized(false); }} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer flex items-center justify-center group" title="Maximize">
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black">+</span>
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-2 min-h-0">
            {history.map((line, i) => (
              <div key={i} className={
                line.startsWith('Error') ? 'text-red-400' : 
                line.startsWith('[ALPACA]') ? 'text-pink-400 font-bold bg-pink-500/10 px-1 rounded' : 
                'text-[var(--accent-cyan)]'
              }>
                {line}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)] shrink-0">
            <span className="text-[var(--accent-cyan)] font-bold">root@terminal:~#</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-[var(--text-main)] placeholder-[var(--text-muted)]"
              placeholder="Type /backtest AAPL..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
