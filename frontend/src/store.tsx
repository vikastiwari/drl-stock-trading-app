import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoreState {
  theme: string;
  setTheme: (newTheme: string) => void;
  modalType: string | null;
  isModalOpen: boolean;
  openModal: (type: string) => void;
  closeModal: () => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'dark');
  const [modalType, setModalType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setTheme = (newTheme: string) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
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
    <StoreContext.Provider value={{ theme, setTheme, modalType, isModalOpen, openModal, closeModal }}>
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
