
import { useState, useEffect, useCallback } from 'react';
import { Child, CompletedDay, Recording, TokenType, Gift } from '@/types';

// Global state storage
const globalState: {
  children: Child[];
  completedDays: CompletedDay[];
  recordings: Recording[];
  tokens: TokenType[];
  gifts: Gift[];
  [key: string]: any; // Allow additional keys
} = {
  children: [],
  completedDays: [],
  recordings: [],
  tokens: [
    {
      id: 'token-10',
      title: '10 tokens',
      icon: 'coins',
      description: 'Gagner 10 tokens',
      unlocked: false,
      value: 10
    },
    {
      id: 'token-20',
      title: '20 tokens',
      icon: 'coins',
      description: 'Gagner 20 tokens',
      unlocked: false,
      value: 20
    },
    {
      id: 'token-30',
      title: '30 tokens',
      icon: 'coins',
      description: 'Gagner 30 tokens',
      unlocked: false,
      value: 30
    },
    {
      id: 'token-40',
      title: '40 tokens',
      icon: 'coins',
      description: 'Gagner 40 tokens',
      unlocked: false,
      value: 40
    },
    {
      id: 'token-50',
      title: '50 tokens',
      icon: 'coins',
      description: 'Gagner 50 tokens',
      unlocked: false,
      value: 50
    }
  ],
  gifts: []
};

// List of setter functions to notify all components of changes
const listeners: { [key: string]: Set<(data: any) => void> } = {
  children: new Set(),
  completedDays: new Set(),
  recordings: new Set(),
  tokens: new Set(),
  gifts: new Set()
};

// Load saved state from localStorage on app initialization
const loadStateFromLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      Object.keys(globalState).forEach(key => {
        const storedValue = window.localStorage.getItem(`global_${key}`);
        if (storedValue) {
          globalState[key] = JSON.parse(storedValue);
        }
      });
    }
  } catch (error) {
    console.warn('Error loading global state from localStorage:', error);
  }
};

// Initialize by loading from localStorage
loadStateFromLocalStorage();

// Function to save state to localStorage
const saveStateToLocalStorage = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`global_${key}`, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Error saving global state for key "${key}":`, error);
  }
};

export function useGlobalState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from global state or initial value
  const [state, setState] = useState<T>(() => {
    // If the key exists in global state, use that
    if (key in globalState) {
      return globalState[key] as unknown as T;
    }
    
    // Otherwise use the initial value
    globalState[key] = initialValue as any;
    saveStateToLocalStorage(key, initialValue);
    return initialValue;
  });

  // Set up listener for changes
  useEffect(() => {
    const updateState = (newValue: T) => {
      setState(newValue);
    };

    // Create the listeners set if it doesn't exist
    if (!listeners[key]) {
      listeners[key] = new Set();
    }

    // Add this component's setState to listeners
    listeners[key].add(updateState);

    // Return cleanup function
    return () => {
      listeners[key].delete(updateState);
    };
  }, [key]);

  // Define the setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(state) : value;
    
    // Update global state
    globalState[key] = valueToStore as any;
    
    // Save to localStorage
    saveStateToLocalStorage(key, valueToStore);
    
    // Notify all listeners
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(valueToStore));
    }
    
    // Update local state
    setState(valueToStore);
  }, [key, state]);

  return [state, setValue];
}

// This function allows easy initialization from localStorage for migration purposes
export function initializeFromLocalStorage() {
  loadStateFromLocalStorage();
  
  // Notify all listeners
  Object.keys(globalState).forEach(key => {
    if (listeners[key]) {
      listeners[key].forEach(listener => listener(globalState[key]));
    }
  });
}

// Call this when the app loads to ensure data is loaded from localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('load', initializeFromLocalStorage);
}
