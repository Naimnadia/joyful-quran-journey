
import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { fetchData, syncData } from '@/lib/supabase';
import type { Child, CompletedDay, Recording, TokenType, Gift } from '@/types';
import { toast } from 'sonner';

// Define the shape of our global state
interface GlobalState {
  [key: string]: any;
}

// Create context
const GlobalStateContext = createContext<{
  state: GlobalState;
  setState: (key: string, value: any) => void;
}>({
  state: {},
  setState: () => {}
});

// Create a provider component
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<GlobalState>({});

  const setState = useCallback((key: string, value: any) => {
    setStateRaw(prevState => ({
      ...prevState,
      [key]: value
    }));
    
    // Also update localStorage for backward compatibility
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, []);

  return (
    <GlobalStateContext.Provider value={{ state, setState }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// Create a hook to use the global state
export function useGlobalState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { state, setState } = useContext(GlobalStateContext);
  
  // If the value doesn't exist in state yet, initialize it
  if (state[key] === undefined && initialValue !== undefined) {
    setState(key, initialValue);
  }
  
  const value = state[key] !== undefined ? state[key] : initialValue;
  
  const setValue = useCallback((newValue: T) => {
    setState(key, newValue);
  }, [key, setState]);
  
  return [value, setValue];
}

// Initialize data from backend
export async function initializeFromBackend(): Promise<void> {
  try {
    console.log('Initializing from backend...');
    
    // Load data from localStorage first
    const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
      }
    };
    
    // Load local data
    const children = loadFromLocalStorage<Child[]>('children', []);
    const completedDays = loadFromLocalStorage<CompletedDay[]>('completedDaysV2', []);
    const recordings = loadFromLocalStorage<Recording[]>('recordingsV2', []);
    const tokens = loadFromLocalStorage<TokenType[]>('tokens', []);
    const gifts = loadFromLocalStorage<Gift[]>('gifts', []);
    
    // Sync with Supabase (non-blocking)
    // We use Promise.all to run these in parallel but we don't await them
    // This helps ensure UI isn't blocked, even if Supabase operations fail
    Promise.all([
      syncData('children', children)
        .then(syncedChildren => {
          localStorage.setItem('children', JSON.stringify(syncedChildren));
        })
        .catch(error => {
          console.error('Error syncing children:', error);
        }),
      
      syncData('completed_days', completedDays)
        .then(syncedCompletedDays => {
          localStorage.setItem('completedDaysV2', JSON.stringify(syncedCompletedDays));
        })
        .catch(error => {
          console.error('Error syncing completed days:', error);
        }),
      
      syncData('recordings', recordings)
        .then(syncedRecordings => {
          localStorage.setItem('recordingsV2', JSON.stringify(syncedRecordings));
        })
        .catch(error => {
          console.error('Error syncing recordings:', error);
        }),
      
      syncData('tokens', tokens)
        .then(syncedTokens => {
          localStorage.setItem('tokens', JSON.stringify(syncedTokens));
        })
        .catch(error => {
          console.error('Error syncing tokens:', error);
        }),
      
      syncData('gifts', gifts)
        .then(syncedGifts => {
          localStorage.setItem('gifts', JSON.stringify(syncedGifts));
        })
        .catch(error => {
          console.error('Error syncing gifts:', error);
        })
    ]).catch(error => {
      console.error('Error in Promise.all during backend initialization:', error);
    });
    
    console.log('Backend initialization complete');
  } catch (error) {
    console.error('Failed to initialize from backend:', error);
    // Don't rethrow - we want the app to continue even if backend init fails
  }
}
