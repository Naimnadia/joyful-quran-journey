// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rgrrrblhtzanuybdwlfq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncnJyYmxodHphbnV5YmR3bGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTQ4ODksImV4cCI6MjA1OTg5MDg4OX0.wxlu8ApzHK2DlfhNQyFo91B0CQcKB7_SMYahripIzvY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);