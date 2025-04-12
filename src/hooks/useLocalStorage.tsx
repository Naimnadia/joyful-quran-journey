
import { useState, useEffect } from 'react';
import { useGlobalState } from './useGlobalState';
import { toast } from 'sonner';
import { syncData } from '@/lib/supabase';
import type { Child, CompletedDay, Recording, Gift } from '@/types';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const { state, setState } = useGlobalState();
  
  // Get initial value from localStorage or use initialValue
  const [localValue, setLocalValue] = useState<T>(() => {
    // Try to get from localStorage first
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
  
  // Sync with Supabase on first render if required
  useEffect(() => {
    const performSync = async () => {
      if (state.isInitialized && state.isOnline && (key === 'children' || key === 'completedDaysV2')) {
        try {
          // Convert key to a valid table name
          const tableName = key === 'completedDaysV2' ? 'completed_days' : key;
          
          // Handle children data with proper typing
          if (key === 'children') {
            const localChildren = localValue as Child[];
            const syncedData = await syncData<Child>(tableName, localChildren);
            
            if (JSON.stringify(syncedData) !== JSON.stringify(localValue)) {
              setLocalValue(syncedData as unknown as T);
              window.localStorage.setItem(key, JSON.stringify(syncedData));
              
              // Update global state with properly typed data
              setState(prev => ({ 
                ...prev, 
                children: syncedData 
              }));
            }
          } 
          // Handle completed days data with proper typing
          else if (key === 'completedDaysV2') {
            const localCompletedDays = localValue as CompletedDay[];
            const syncedData = await syncData<CompletedDay>(tableName, localCompletedDays);
            
            if (JSON.stringify(syncedData) !== JSON.stringify(localValue)) {
              setLocalValue(syncedData as unknown as T);
              window.localStorage.setItem(key, JSON.stringify(syncedData));
              
              // Update global state with properly typed data
              setState(prev => ({ 
                ...prev, 
                completedDays: syncedData 
              }));
            }
          }
        } catch (error) {
          console.error(`Error syncing ${key} with Supabase:`, error);
        }
      }
    };
    
    performSync();
  }, [key, state.isInitialized, state.isOnline]);
  
  // Update function that will update both local state and localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for state updates
      const valueToStore = value instanceof Function ? value(localValue) : value;
      
      // Save to local state
      setLocalValue(valueToStore);
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Update global state if needed with proper type casting
      if (key === 'children') {
        setState(prev => ({ 
          ...prev, 
          children: valueToStore as Child[] 
        }));
      } else if (key === 'completedDaysV2') {
        setState(prev => ({ 
          ...prev, 
          completedDays: valueToStore as CompletedDay[] 
        }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      toast.error('Failed to save data. Changes may not persist if you close the browser.');
    }
  };
  
  return [localValue, setValue] as const;
}
