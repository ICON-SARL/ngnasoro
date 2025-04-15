
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://xnqysvnychmsockivqhb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucXlzdm55Y2htc29ja2l2cWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzAyNTgsImV4cCI6MjA1ODQwNjI1OH0.ENlPLNrFbgDyZhPIpUXHwt1IiElORGFeHpZItOxpBOA';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
