
import { supabase } from '@/integrations/supabase/client';
import { UserSfd } from './types';

export async function fetchUserSfds(userId: string): Promise<UserSfd[]> {
  try {
    const { data, error } = await supabase
      .from('user_sfds')
      .select(`
        id,
        is_default,
        sfds:sfd_id (
          id, 
          name, 
          code,
          region,
          logo_url
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching SFDs:', error);
      throw error;
    }

    // Transform the data to match the UserSfd interface
    const userSfds: UserSfd[] = (data || []).map((item: any) => ({
      id: item.id,
      is_default: item.is_default,
      sfds: {
        id: item.sfds.id,
        name: item.sfds.name,
        code: item.sfds.code,
        region: item.sfds.region,
        logo_url: item.sfds.logo_url
      }
    }));

    return userSfds;
  } catch (error) {
    console.error('Error in fetchUserSfds:', error);
    return [];
  }
}
