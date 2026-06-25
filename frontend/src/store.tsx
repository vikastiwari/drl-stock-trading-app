import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { supabase } from './supabaseClient';

interface StoreState {
  theme: string;
  setTheme: (newTheme: string) => void;
  apiKeys: { apcaKey: string; geminiKey: string };
  setApiKeys: (keys: { apcaKey: string; geminiKey: string }) => void;
  modalType: string | null;
  isModalOpen: boolean;
  openModal: (type: string) => void;
  closeModal: () => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'dark');
  const [apiKeys, setApiKeysState] = useState(() => {
    try {
      const keys = localStorage.getItem('apiKeys');
      return keys ? JSON.parse(keys) : { apcaKey: '', geminiKey: '' };
    } catch {
      return { apcaKey: '', geminiKey: '' };
    }
  });
  const [modalType, setModalType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync with Supabase on mount if available
  useEffect(() => {
    if (supabase) {
      supabase.from('user_settings').select('*').limit(1).single()
        .then(({ data }) => {
          if (data) {
            if (data.theme) setThemeState(data.theme);
            if (data.apca_key || data.gemini_key) {
              setApiKeysState({ apcaKey: data.apca_key || '', geminiKey: data.gemini_key || '' });
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    if (supabase) {
      supabase.from('user_settings').upsert({ id: 1, theme: newTheme }).catch(console.error);
    }
  };

  const setApiKeys = (keys: { apcaKey: string; geminiKey: string }) => {
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    setApiKeysState(keys);
    if (supabase) {
      supabase.from('user_settings').upsert({ id: 1, apca_key: keys.apcaKey, gemini_key: keys.geminiKey }).catch(console.error);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalType(null), 300); // Clear after animation
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <StoreContext.Provider value={{ theme, setTheme, apiKeys, setApiKeys, modalType, isModalOpen, openModal, closeModal }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
