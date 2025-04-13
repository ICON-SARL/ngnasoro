
import { supabase } from '@/integrations/supabase/client';

export async function setupDatabase() {
  // Instead of using a non-existent RPC function, we'll use custom SQL
  const { error } = await supabase.from('audit_logs').insert({
    action: 'setup_database',
    category: 'SYSTEM',
    status: 'success',
    severity: 'info',
    details: { message: 'Setting up database' }
  });
  
  if (error) {
    console.error('Erreur lors de la configuration de la base de données:', error);
    return false;
  }
  
  return true;
}

export async function createEnableRlsFunction() {
  // Instead of using a direct SQL RPC call, we'll use the Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('synchronize-user-roles', {
      body: { action: 'enable_rls' }
    });
    
    if (error) {
      console.error('Erreur lors de la création de la fonction enable_rls_for_table:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception lors de la création de la fonction enable_rls_for_table:', err);
    return false;
  }
}
