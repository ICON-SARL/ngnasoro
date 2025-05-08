
import { supabase } from '@/integrations/supabase/client';

export async function fetchActiveSfds() {
  try {
    console.log('Fetching active SFDs from database');
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching SFDs:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in fetchActiveSfds:', error);
    return null;
  }
}

export async function fetchSfdsFromEdgeFunction(userId?: string) {
  try {
    console.log('Fetching SFDs from edge function');
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { userId, forceFullSync: true }
    });

    if (error) {
      console.error('Error invoking edge function:', error);
      return null;
    }

    return data?.syncedAccounts || [];
  } catch (error) {
    console.error('Exception in fetchSfdsFromEdgeFunction:', error);
    return null;
  }
}

export function normalizeSfdData(sfds: any[]) {
  return sfds.map(sfd => ({
    id: sfd.id || sfd.sfd_id,
    name: sfd.name || sfd.sfd_name,
    code: sfd.code || sfd.sfd_code,
    region: sfd.region,
    status: sfd.status || 'active',
    logo_url: sfd.logo_url
  }));
}
