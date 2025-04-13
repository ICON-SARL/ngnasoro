
import { supabase } from '@/integrations/supabase/client';

export async function setupDatabase() {
  const { error } = await supabase.rpc('setup_database');
  
  if (error) {
    console.error('Erreur lors de la configuration de la base de données:', error);
    return false;
  }
  
  return true;
}

export async function createEnableRlsFunction() {
  // Note: Cette fonction ajoute la fonction enable_rls_for_table
  // à votre base de données, mais doit être exécutée par un utilisateur
  // avec des privilèges administratifs
  const sql = `
  CREATE OR REPLACE FUNCTION public.enable_rls_for_table(table_name text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  END;
  $$;
  `;
  
  const { error } = await supabase.rpc('run_sql', { sql });
  
  if (error) {
    console.error('Erreur lors de la création de la fonction enable_rls_for_table:', error);
    return false;
  }
  
  return true;
}
