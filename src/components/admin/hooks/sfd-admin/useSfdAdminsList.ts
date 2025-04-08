
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  sfd_id: string;
  created_at: string;
  last_sign_in_at?: string;
}

export function useSfdAdminsList() {
  const [sfdId, setSfdId] = useState<string | null>(null);

  const fetchSfdAdmins = useCallback(async (id: string | null) => {
    if (!id) return [];

    const { data: userSfdAssociations, error: associationsError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', id);

    if (associationsError) {
      console.error('Error fetching SFD user associations:', associationsError);
      throw associationsError;
    }

    if (!userSfdAssociations || userSfdAssociations.length === 0) {
      return [];
    }

    const userIds = userSfdAssociations.map(assoc => assoc.user_id);

    const { data: adminUsers, error: adminsError } = await supabase
      .from('admin_users')
      .select('*')
      .in('id', userIds)
      .eq('role', 'sfd_admin');

    if (adminsError) {
      console.error('Error fetching SFD admins:', adminsError);
      throw adminsError;
    }

    // Attach sfd_id to each admin user record
    return adminUsers?.map(admin => ({
      ...admin,
      sfd_id: id
    })) || [];
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-admins', sfdId],
    queryFn: () => fetchSfdAdmins(sfdId),
    enabled: !!sfdId,
  });

  const refetchAdmins = useCallback((id: string) => {
    setSfdId(id);
    return refetch();
  }, [refetch]);

  return {
    sfdAdmins: data as SfdAdmin[] || [],
    isLoading,
    error,
    refetch: refetchAdmins,
  };
}
