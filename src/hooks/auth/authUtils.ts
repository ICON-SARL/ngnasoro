
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  // This function transforms a Supabase user to our custom User type
  // We're just passing it through for now, but you can add custom properties here
  return supabaseUser as User;
};
