/**
 * Centralized Auth Utilities for Edge Functions
 * 
 * Provides JWT validation and user extraction.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthResult {
  user: {
    id: string;
    email?: string;
    role?: string;
  } | null;
  error: string | null;
}

/**
 * Extracts and validates user from Authorization header
 */
export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { user: null, error: 'Missing Authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, error: 'Invalid Authorization header format' };
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return { user: null, error: 'Missing Supabase configuration' };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.app_metadata?.role
    },
    error: null
  };
}

/**
 * Checks if user has a specific role
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceKey) {
    return false;
  }
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  
  return !error && !!data;
}

/**
 * Creates a Supabase client with service role for admin operations
 */
export function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase service configuration');
  }
  
  return createClient(supabaseUrl, serviceKey);
}

export default { authenticateRequest, hasRole, createServiceClient };
