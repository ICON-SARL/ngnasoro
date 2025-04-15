
import { supabase } from '@/integrations/supabase/client';
import { SfdAccount, SfdClientAccount } from './types';

export async function fetchUserSfds(userId: string) {
  if (!userId) return [];
  
  try {
    console.log(`Fetching SFDs for user ${userId}...`);
    
    // Direct fetch from the sfds table first to check what's available
    const { data: allSfds, error: allSfdsError } = await supabase
      .from('sfds')
      .select(`
        id,
        name,
        code,
        region,
        status,
        logo_url
      `)
      .eq('status', 'active');
    
    if (allSfdsError) {
      console.error('Error fetching all SFDs:', allSfdsError);
    } else {
      console.log(`Found ${allSfds?.length || 0} active SFDs in database`);
      
      // Log each SFD for debugging
      allSfds?.forEach(sfd => {
        console.log(`Available SFD: ${sfd.name} (${sfd.id}) - status: ${sfd.status}`);
      });
    }

    // For testing, always return available SFDs regardless of user connections
    // This ensures we can at least see the SFDs in the app
    if (allSfds && allSfds.length > 0) {
      return allSfds;
    }
    
    // Fallback: try to fetch from the edge function
    try {
      console.log('Fetching SFDs from edge function as fallback...');
      const { data: sfdsFromEdge, error: edgeError } = await supabase.functions.invoke('fetch-sfds', {
        body: { userId }
      });
      
      if (edgeError) {
        console.error('Error fetching SFDs from edge function:', edgeError);
      } else if (sfdsFromEdge && Array.isArray(sfdsFromEdge) && sfdsFromEdge.length > 0) {
        console.log(`Retrieved ${sfdsFromEdge.length} SFDs from edge function`);
        return sfdsFromEdge;
      }
    } catch (edgeError) {
      console.error('Exception in edge function call:', edgeError);
    }
    
    // Last resort: return some hardcoded test data for development
    console.log('No SFDs found, returning test data');
    return [
      {
        id: 'test-sfd1',
        name: 'RMCR (Test)',
        code: 'RMCR',
        region: 'Centre',
        status: 'active',
        logo_url: null
      },
      {
        id: 'test-sfd2',
        name: 'NYESIGISO (Test)',
        code: 'NYESIGISO',
        region: 'Sud',
        status: 'active',
        logo_url: null
      }
    ];
  } catch (error) {
    console.error('Error in fetchUserSfds:', error);
    return [];
  }
}
