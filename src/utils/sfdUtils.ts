
import { supabase } from '@/integrations/supabase/client';

export const fetchActiveSfds = async () => {
  try {
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active SFDs:', error);
    return [];
  }
};

export const fetchSfdsFromEdgeFunction = async (userId: string) => {
  try {
    // This is a placeholder - in a real app, you would call an edge function
    console.log('Would call edge function to get SFDs for user:', userId);
    // For now, return an empty array
    return [];
  } catch (error) {
    console.error('Error fetching SFDs from edge function:', error);
    return [];
  }
};

export const normalizeSfdData = (sfds: any[]) => {
  if (!Array.isArray(sfds)) return [];
  
  return sfds.map(sfd => ({
    id: sfd.id || '',
    name: sfd.name || 'Unknown SFD',
    code: sfd.code || '',
    logo_url: sfd.logo_url || null,
    region: sfd.region || '',
    status: sfd.status || 'active'
  }));
};
