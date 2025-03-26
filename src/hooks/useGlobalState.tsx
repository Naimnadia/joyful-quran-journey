
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types for our global state
type GlobalState = {
  children: Child[];
  recordings: Recording[];
  tokens: number;
  gifts: Gift[];
  completedDays: CompletedDay[];
  selectedChild: Child | null;
};

// Define child type
export type Child = {
  id: string;
  name: string;
  avatar?: string;
  createdAt?: string;
};

// Define recording type
export type Recording = {
  id: string;
  childId: string;
  date: string;
  audioUrl: string;
  duration: number;
};

// Define gift type
export type Gift = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenCost: number;
  available: boolean;
};

// Define completed day type
export type CompletedDay = {
  id: string;
  childId: string;
  date: string;
};

type GlobalStateContextType = {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  setSelectedChild: (child: Child | null) => void;
};

// Default state
const initialState: GlobalState = {
  children: [],
  recordings: [],
  tokens: 0,
  gifts: [],
  completedDays: [],
  selectedChild: null,
};

// Create context
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Initialize data from backend
export const initializeFromBackend = async (): Promise<void> => {
  console.info('Initializing from backend...');
  
  try {
    // Initialize data synchronization with Supabase
    // Fetch children, recordings, tokens, gifts, and completed days
    // This is just a placeholder for actual implementation
    
    console.info('Backend initialization complete');
  } catch (error) {
    console.error('Failed to initialize backend:', error);
  }
};

// Provider component
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(initialState);

  const setSelectedChild = (child: Child | null) => {
    setState(prevState => ({
      ...prevState,
      selectedChild: child
    }));
  };

  // Effect to sync with Supabase
  useEffect(() => {
    // Subscribe to changes or fetch initial data
    // This would be implemented in a real app
  }, []);

  return (
    <GlobalStateContext.Provider value={{ 
      state, 
      setState, 
      setSelectedChild
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook to use the global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
