
import { supabase } from '@/integrations/supabase/client';
import type { Child, CompletedDay, Recording, TokenType, Gift } from '@/types';

// Table interface mapping
export interface Tables {
  children: Child;
  completed_days: CompletedDay;
  recordings: Recording;
  tokens: TokenType;
  gifts: Gift;
}

// Helper functions for data access
export async function fetchData<T>(table: keyof Tables): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table as string)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
}

export async function saveData<T>(table: keyof Tables, data: T[]): Promise<void> {
  try {
    // Remove all existing data (simplified approach)
    const { error: deleteError } = await supabase
      .from(table as string)
      .delete()
      .not('id', 'is', null);
    
    if (deleteError) throw deleteError;
    
    // Insert new data
    if (data.length > 0) {
      const { error: insertError } = await supabase
        .from(table as string)
        .insert(data as any[]);
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error(`Error saving ${table}:`, error);
  }
}

export async function syncData<T>(table: keyof Tables, localData: T[]): Promise<T[]> {
  try {
    // Simplified sync mechanism - in real app, you'd implement more complex merging
    const remoteData = await fetchData<T>(table);
    
    if (remoteData.length > 0) {
      return remoteData;
    } else {
      await saveData(table, localData);
      return localData;
    }
  } catch (error) {
    console.error(`Error syncing ${table}:`, error);
    return localData;
  }
}
