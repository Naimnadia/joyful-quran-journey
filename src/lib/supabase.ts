
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
    // Convert table names if needed
    let tableName = table;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    
    // Transform data if needed (convert snake_case fields to camelCase)
    let transformedData = data;
    if (table === 'children') {
      transformedData = data.map((item: any) => ({
        ...item,
        createdAt: item.created_at
      }));
    } else if (table === 'completed_days') {
      transformedData = data.map((item: any) => ({
        ...item,
        childId: item.child_id
      }));
    }
    
    return (transformedData || []) as T[];
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }
}

export async function saveData<T>(table: keyof Tables, data: T[]): Promise<void> {
  try {
    // Use exact table name from the Tables interface
    let tableName = table;
    
    // Transform data if needed (convert camelCase fields to snake_case)
    let transformedData = data;
    if (table === 'children') {
      transformedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        created_at: item.createdAt || new Date().toISOString(),
        avatar: item.avatar
      }));
    } else if (table === 'completed_days') {
      transformedData = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        child_id: item.childId
      }));
    }
    
    // Remove all existing data (simplified approach)
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .not('id', 'is', null);
    
    if (deleteError) throw deleteError;
    
    // Insert new data
    if (transformedData.length > 0) {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(transformedData as any[]);
      
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
