import { motion } from 'framer-motion';
import { BrainCircuit, Cpu } from 'lucide-react';

interface AIReasoningPanelProps {
  targetWeights: { [key: string]: number } | null;
}

export function AIReasoningPanel({ targetWeights }: AIReasoningPanelProps) {
  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">PyTorch Agent</h2>
          <p className="text-xs text-[var(--text-muted)]">Live Decision Matrix</p>
        </div>
      </div>

      <div className="space-y-5">
        {!targetWeights ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)] animate-pulse">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">Awaiting neural inference stream...</span>
          </div>
        ) : (
          Object.entries(targetWeights).map(([asset, weight]) => (
            <div key={asset}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm text-[var(--text-main)]">{asset}</span>
                <span className="font-mono text-sm text-blue-400">{(weight * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[var(--bg-dark)] rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weight * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className={`h-2.5 rounded-full ${
                    asset === 'CASH' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
