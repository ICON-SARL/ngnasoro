
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SfdAccount } from '@/types/sfdAccounts';

export function useSfdAccounts() {
  const { user } = useAuth();

  const fetchSfdAccounts = async (): Promise<SfdAccount[]> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    try {
      const { data, error } = await supabase
        .from('sfd_accounts')
        .select('*')
        .order('sfd_id', { ascending: true });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching SFD accounts:', error);
      return [];
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-accounts'],
    queryFn: fetchSfdAccounts,
    enabled: !!user,
  });

  return {
    accounts: data,
    isLoading,
    error,
    refetch
  };
}
