
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSfdAdminManagement() {
  // Get list of SFD admins
  const { data: sfdAdmins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('role', 'sfd_admin');
      
      if (error) {
        throw new Error(`Error fetching SFD admins: ${error.message}`);
      }
      
      return data || [];
    }
  });

  return {
    sfdAdmins,
    isLoading,
    error,
    refetch
  };
}
