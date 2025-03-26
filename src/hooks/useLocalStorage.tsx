import { useState, useEffect } from 'react';
import { useGlobalState } from './useGlobalState';
import { toast } from 'sonner';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const { getStateProperty, setStateProperty } = useGlobalState();
  const globalState = getStateProperty('state');
  
  // Use local state as a fallback for the global state
  const [localValue, setLocalValue] = useState<T>(() => {
    // Get the value from global state first if available
    if (key in globalState) {
      return (globalState as any)[key] as T;
    }
    
    // Otherwise try to get from localStorage
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    }
    
    return initialValue;
  });
  
  // Update function that will update both local state and global state
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for state updates
      const valueToStore = value instanceof Function ? value(localValue) : value;
      
      // Save to local state
      setLocalValue(valueToStore);
      
      // Update global state if possible
      if (key in globalState) {
        setStateProperty(key as any, valueToStore as any);
      }
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      toast.error('Failed to save data. Changes may not persist if you close the browser.');
    }
  };
  
  // Initial load from localStorage for migration (only once)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          setValue(parsedItem);
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return [localValue, setValue] as const;
}
