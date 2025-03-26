
import { useEffect } from 'react';
import { useGlobalState } from './useGlobalState';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use global state instead of localStorage
  const [storedValue, setStoredValue] = useGlobalState<T>(key, initialValue);
  
  // For backward compatibility, also update localStorage when global state changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Initial load from localStorage for migration (only once)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setStoredValue] as const;
}
