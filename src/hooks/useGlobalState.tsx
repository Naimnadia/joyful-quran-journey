import { useState, useEffect, useCallback } from 'react';
import { Child, CompletedDay, Recording, TokenType, Gift } from '@/types';

// Global state storage
const globalState: {
  children: Child[];
  completedDays: CompletedDay[];
  recordings: Recording[];
  tokens: TokenType[];
  gifts: Gift[];
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

export function useGlobalState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from global state or initial value
  const [state, setState] = useState<T>(() => {
    // If the key exists in global state, use that
    if (key in globalState) {
      return globalState[key as keyof typeof globalState] as unknown as T;
    }
    
    // Otherwise use the initial value
    globalState[key as keyof typeof globalState] = initialValue as any;
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
    globalState[key as keyof typeof globalState] = valueToStore as any;
    
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
  // Only run in browser
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // For each key in global state, try to load from localStorage
    Object.keys(globalState).forEach(key => {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        globalState[key as keyof typeof globalState] = parsedValue;
        
        // Notify listeners
        if (listeners[key]) {
          listeners[key].forEach(listener => listener(parsedValue));
        }
      }
    });
  } catch (error) {
    console.warn('Error loading data from localStorage:', error);
  }
}
