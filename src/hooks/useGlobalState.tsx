
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { syncData } from '@/lib/supabase';
import type { Child, CompletedDay, Recording, Gift } from '@/types';

// Define types for our global state
type GlobalState = {
  children: Child[];
  recordings: Recording[];
  tokens: number;
  gifts: Gift[];
  completedDays: CompletedDay[];
  selectedChild: Child | null;
  isInitialized: boolean;
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
  isInitialized: false,
};

// Create context
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Initialize data from backend
export const initializeFromBackend = async (): Promise<void> => {
  console.info('Initializing from backend...');
  
  try {
    // This is just a placeholder for the actual initialization
    // The real initialization happens in the GlobalStateProvider
    console.info('Backend initialization complete');
  } catch (error) {
    console.error('Failed to initialize backend:', error);
  }
};

// Provider component
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(initialState);

  // Run synchronization only once on mount
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        // We'll get data from localStorage in the useLocalStorage hook
        // and then sync it with Supabase
        console.log('Performing initial Supabase sync');
        
        // Mark initialization as complete to prevent infinite loops
        setState(prev => ({
          ...prev,
          isInitialized: true
        }));
      } catch (error) {
        console.error('Error during initial sync:', error);
        setState(prev => ({
          ...prev,
          isInitialized: true
        }));
      }
    };

    if (!state.isInitialized) {
      syncWithBackend();
    }
  }, [state.isInitialized]);

  const setSelectedChild = (child: Child | null) => {
    setState(prevState => ({
      ...prevState,
      selectedChild: child
    }));
  };

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
