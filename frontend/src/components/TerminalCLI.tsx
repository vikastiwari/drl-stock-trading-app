import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TerminalCLIProps {
  onCommand: (command: string, args: string[]) => void;
}

export default function TerminalCLI({ onCommand }: TerminalCLIProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['> System initialized.', '> Ready for commands.']);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

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
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col h-48 font-mono text-xs overflow-hidden mt-4 shadow-lg shadow-[var(--accent-cyan)]/5"
    >
      <div className="flex justify-between items-center mb-2 border-b border-[var(--border-subtle)] pb-2">
        <span className="text-[var(--text-muted)] tracking-wider">INSTITUTIONAL TERMINAL CLI</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-2">
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('Error') ? 'text-red-400' : 'text-[var(--accent-cyan)]'}>
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-[var(--accent-cyan)] font-bold">root@terminal:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none flex-1 text-[var(--text-main)] placeholder-[var(--text-muted)]"
          placeholder="Type /backtest AAPL or /vpvr MSFT..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </motion.div>
  );
}
