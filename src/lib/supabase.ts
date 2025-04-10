
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
    
    return (transformedData || []) as unknown as T[];
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    return [] as T[];
  }
}

export async function saveData<T>(table: keyof Tables, data: T[]): Promise<void> {
  try {
    // Use exact table name from the Tables interface
    let tableName = table;
    
    // Transform data if needed (convert camelCase fields to snake_case)
    let transformedData;
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
    } else {
      transformedData = data;
    }
    
    // Only delete and insert if we have data to save
    if (transformedData.length > 0) {
      // Remove all existing data
      try {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .not('id', 'is', null);
        
        if (deleteError) throw deleteError;
      } catch (deleteError) {
        console.error(`Error deleting data from ${table}:`, deleteError);
        // Continue with insert even if delete fails
      }
      
      // Insert new data
      try {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(transformedData as any[]);
        
        if (insertError) throw insertError;
      } catch (insertError) {
        console.error(`Error inserting data to ${table}:`, insertError);
      }
    }
  } catch (error) {
    console.error(`Error saving ${table}:`, error);
  }
}

export async function syncData<T>(table: keyof Tables, localData: T[]): Promise<T[]> {
  try {
    console.info(`Syncing data for ${table}...`);
    
    // Get remote data first
    const remoteData = await fetchData<T>(table);
    
    if (remoteData.length > 0) {
      console.info(`Remote data found for ${table}, using that instead of local data`);
      return remoteData;
    } else if (localData.length > 0) {
      console.info(`No remote data found for ${table}, saving local data to Supabase`);
      await saveData(table, localData);
      return localData;
    }
    
    // If both remote and local data are empty, return empty array
    return localData;
  } catch (error) {
    console.error(`Error in syncData for ${table}:`, error);
    return localData;
  }
}
