
import { createClient } from '@supabase/supabase-js'
import type { Child, CompletedDay, Recording, TokenType, Gift } from '@/types'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
)

// Table interface mapping
export interface Tables {
  children: Child
  completed_days: CompletedDay
  recordings: Recording
  tokens: TokenType
  gifts: Gift
}

// Helper functions for data access
export async function fetchData<T>(table: keyof Tables): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching ${table}:`, error)
    return []
  }
}

export async function saveData<T>(table: keyof Tables, data: T[]): Promise<void> {
  try {
    // Remove all existing data (simplified approach)
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .not('id', 'is', null)
    
    if (deleteError) throw deleteError
    
    // Insert new data
    if (data.length > 0) {
      const { error: insertError } = await supabase
        .from(table)
        .insert(data)
      
      if (insertError) throw insertError
    }
  } catch (error) {
    console.error(`Error saving ${table}:`, error)
  }
}

export async function syncData<T>(table: keyof Tables, localData: T[]): Promise<T[]> {
  try {
    // Simplified sync mechanism - in real app, you'd implement more complex merging
    const remoteData = await fetchData<T>(table)
    
    if (remoteData.length > 0) {
      return remoteData
    } else {
      await saveData(table, localData)
      return localData
    }
  } catch (error) {
    console.error(`Error syncing ${table}:`, error)
    return localData
  }
}
