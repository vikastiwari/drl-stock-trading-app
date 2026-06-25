import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Activity, User, CreditCard, X, Shield, Zap, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export const GlobalModal = () => {
  const { isModalOpen, closeModal, modalType, theme, setTheme, apiKeys, setApiKeys } = useStore();

  if (!isModalOpen) return null;

  const contentMap: Record<string, any> = {
    preferences: {
      icon: <Settings size={28} className="text-cyan-400" />,
      title: "Trading Preferences",
      desc: "Configure your risk tolerance and AI parameters",
      render: () => (
        <div className="flex flex-col gap-6 mt-4 text-[var(--text-main)]">
          <div className="flex justify-between items-center p-4 bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-base font-medium">UI Theme</div>
              <div className="text-sm text-[var(--text-muted)]">Select your preferred visual style</div>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="p-2 bg-[var(--bg-dark)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-lg cursor-pointer outline-none"
            >
              <option value="dark">Dark Mode (Default)</option>
              <option value="light">Light Mode</option>
              <option value="amoled">AMOLED Pitch Black</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
            </select>
          </div>
          <div className="p-4 bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl opacity-50 cursor-not-allowed">
            <div className="text-base text-[var(--text-main)] font-medium">Auto-Trading (Coming Soon)</div>
            <div className="text-sm text-[var(--text-muted)]">Allow FinRL model to place live Alpaca orders</div>
          </div>
        </div>
      )
    },
    profile: {
      icon: <User size={28} className="text-emerald-500" />,
      title: "Admin Profile",
      desc: "Manage your credentials and security",
      render: () => (
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.4)]">
              <Shield size={32} color="white" />
            </div>
            <div>
              <h3 className="text-xl text-[var(--text-main)] font-bold">Vikas_Quant</h3>
              <p className="text-sm text-[var(--text-muted)]">Level 4 Clearance • Last login: 2 min ago</p>
            </div>
          </div>
        </div>
      )
    },
      apikeys: {
      icon: <CreditCard size={28} className="text-cyan-400" />,
      title: "API Integrations",
      desc: "Manage Google AI and Alpaca Market Keys",
      render: () => (
        <div className="flex flex-col gap-6 mt-4">
          <div className="p-6 bg-[var(--bg-dark)] border border-cyan-500/50 rounded-xl relative overflow-hidden">
            <h3 className="text-cyan-400 text-lg mb-2 flex items-center gap-2 font-bold">
              <Zap size={18} /> Google AI Studio
            </h3>
            <input 
              type="password"
              placeholder="Enter Gemini API Key..."
              value={apiKeys.geminiKey}
              onChange={(e) => setApiKeys({ ...apiKeys, geminiKey: e.target.value })}
              className="w-full mt-2 p-2 bg-black/30 border border-[var(--border-subtle)] text-[var(--text-main)] rounded-lg outline-none font-mono text-sm"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">Active: Gemini 2.5 Flash Lite</p>
          </div>
          <div className="p-6 bg-[var(--bg-dark)] border border-purple-500/50 rounded-xl relative overflow-hidden">
            <h3 className="text-purple-400 text-lg mb-2 flex items-center gap-2 font-bold">
              <CreditCard size={18} /> Alpaca Trading API
            </h3>
            <input 
              type="password"
              placeholder="Enter Alpaca API Key..."
              value={apiKeys.apcaKey}
              onChange={(e) => setApiKeys({ ...apiKeys, apcaKey: e.target.value })}
              className="w-full mt-2 p-2 bg-black/30 border border-[var(--border-subtle)] text-[var(--text-main)] rounded-lg outline-none font-mono text-sm"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">Environment: Paper Trading</p>
          </div>
        </div>
      )
    },
    alerts: {
      icon: <Bell size={28} className="text-pink-500" />,
      title: "System Alerts",
      desc: "Recent notifications from your RL Agent",
      render: () => (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl">
            <AlertCircle className="text-pink-500 mt-1" size={20} />
            <div>
              <h4 className="text-[var(--text-main)] font-medium">High Volatility Detected</h4>
              <p className="text-[var(--text-muted)] text-sm">AAPL price swings exceed 5% threshold.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[var(--bg-dark)] border border-[var(--border-subtle)] rounded-xl">
            <CheckCircle2 className="text-emerald-500 mt-1" size={20} />
            <div>
              <h4 className="text-[var(--text-main)] font-medium">Model Sync Complete</h4>
              <p className="text-[var(--text-muted)] text-sm">FinRL target weights synced successfully.</p>
            </div>
          </div>
        </div>
      )
    }
  };

  const config = contentMap[modalType || 'preferences'] || contentMap.preferences;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center"
        onClick={closeModal}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel w-[90%] max-w-[500px] p-10 bg-[var(--bg-card)] border border-[var(--border-active)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.15)]"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                {config.icon}
              </div>
              <div>
                <h2 className="text-2xl text-[var(--text-main)] font-bold">{config.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">{config.desc}</p>
              </div>
            </div>
            <button onClick={closeModal} className="text-[var(--text-muted)] hover:text-white transition-colors p-2">
              <X size={24} />
            </button>
          </div>
          
          <div className="h-px bg-[var(--border-subtle)] w-full mb-6"></div>

          {config.render()}

          <div className="mt-8 flex justify-end">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-shadow" 
              onClick={closeModal}
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
