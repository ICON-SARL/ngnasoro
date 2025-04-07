
// Import the createClient function from supabase-js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
// In a production environment, these should be environment variables
// For this demo, we'll use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
