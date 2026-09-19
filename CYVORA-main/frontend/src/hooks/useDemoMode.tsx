import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyvora_demo_mode');
    return saved !== null ? saved === 'true' : true; // Default to Demo Mode on fresh launch for smooth expo
  });

  useEffect(() => {
    localStorage.setItem('cyvora_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);
  const setDemoMode = (enabled: boolean) => setIsDemoMode(enabled);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = (): DemoModeContextType => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
