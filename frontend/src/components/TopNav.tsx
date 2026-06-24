import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User, Sparkles, X, LogOut, CreditCard, Activity, AlertCircle, CheckCircle2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState('');
  
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
        setIsSettingsOpen(false);
        setIsAdminOpen(false);
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      setIsSearching(true);
      setGeminiResponse('Thinking...');
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: searchQuery })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Simulate typing effect for the response
        const targetResponse = data.reply;
        setGeminiResponse('');
        let i = 0;
        const interval = setInterval(() => {
          setGeminiResponse(prev => targetResponse.substring(0, i + 1));
          i++;
          if (i >= targetResponse.length) {
            clearInterval(interval);
          }
        }, 15);

      } catch (error) {
        setGeminiResponse('❌ Failed to connect to the AI Assistant. Make sure the backend is running with a valid GOOGLE_API_KEY.');
      }
    }
  };

  return (
    <header className="topnav glass-panel mb-6 flex justify-between items-center p-4 relative z-50 rounded-xl" ref={navRef}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
          <Activity className="text-cyan-400" /> Retail AI Trader
        </h1>
      </div>

      <div className="flex items-center gap-6 relative">
        
        {/* Gemini Lite Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ask Gemini Lite about trading..." 
            className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-10 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 w-64 focus:w-96"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <Sparkles size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400" />

          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-panel absolute top-12 right-0 w-96 p-4 z-50 border border-cyan-500/30 rounded-xl"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm text-cyan-400 flex items-center gap-2">
                    <Sparkles size={16} /> Gemini 1.5 Lite
                  </h3>
                  <button onClick={() => setIsSearching(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {geminiResponse}
                  {geminiResponse !== 'Thinking...' && <span className="animate-pulse ml-1 text-cyan-400">|</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 items-center">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className={`p-2 rounded-full transition-colors relative ${isAlertsOpen ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
            >
              <Bell size={20} className="text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
            </motion.button>

            <AnimatePresence>
              {isAlertsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="glass-panel absolute top-12 right-0 w-72 rounded-xl border border-slate-700/50 overflow-hidden"
                >
                  <h4 className="p-3 border-b border-slate-700/50 m-0 font-medium text-sm text-slate-200">System Alerts</h4>
                  <div className="p-2">
                    <DropdownItem icon={<AlertCircle className="text-pink-500" size={16} />} title="High Volatility Detected" desc="AAPL price swings exceed 5% threshold." />
                    <DropdownItem icon={<CheckCircle2 className="text-emerald-500" size={16} />} title="Model Sync Complete" desc="FinRL target weights synced successfully." />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Settings Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-slate-700/50' : 'hover:bg-slate-800/50'}`}
            >
              <Settings size={20} className="text-slate-400" />
            </motion.button>
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="glass-panel absolute top-12 right-0 w-56 rounded-xl border border-slate-700/50 overflow-hidden"
                >
                  <div className="p-2">
                    <DropdownItem icon={<Settings size={16} />} title="Trading Preferences" desc="Risk tolerance & sizing" />
                    <DropdownItem icon={<Activity size={16} />} title="UI Theme" desc="Dark (Glassmorphic) Active" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[1px] h-6 bg-slate-700"></div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <motion.button 
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-slate-200 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">Admin</span>
            </motion.button>
            <AnimatePresence>
              {isAdminOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="glass-panel absolute top-12 right-0 min-w-[200px] rounded-xl border border-slate-700/50 overflow-hidden"
                >
                  <div className="p-2">
                    <DropdownItem icon={<User size={16} />} title="My Profile" />
                    <DropdownItem icon={<CreditCard size={16} />} title="API Keys" />
                    <div className="h-[1px] bg-slate-700/50 my-1"></div>
                    <DropdownItem icon={<LogOut size={16} className="text-pink-500" />} title="Logout" titleColor="text-pink-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, title, desc, titleColor = "text-slate-200" }: { icon: React.ReactNode, title: string, desc?: string, titleColor?: string }) {
  return (
    <div className="flex items-start gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-700/50 transition-colors">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <div className={`text-sm font-medium ${titleColor} ${desc ? 'mb-1' : 'mb-0'}`}>{title}</div>
        {desc && <div className="text-xs text-slate-400">{desc}</div>}
      </div>
    </div>
  );
}
