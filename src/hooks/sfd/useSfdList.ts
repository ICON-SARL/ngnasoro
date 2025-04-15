
import { useQuery } from '@tanstack/react-query';
import { fetchUserSfds } from './fetchSfdAccounts';
import { SfdAccount, SfdClientAccount } from './types';
import { User } from '@/hooks/auth/types';

export function useSfdList(user: User | null) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const userSfds = await fetchUserSfds(user.id);
      
      // Transform all SFDs into SfdAccount objects
      const sfdAccounts: SfdClientAccount[] = userSfds.map(userSfd => ({
        id: userSfd.id,
        name: userSfd.name,
        code: userSfd.code,
        region: userSfd.region || '',
        logoUrl: userSfd.logo_url,
        balance: 0, // Balance will be fetched separately
        currency: 'FCFA',
        isDefault: false,
        isVerified: true,
        status: userSfd.status || 'active',
        sfd_id: userSfd.id,
        account_type: 'main'
      }));
      
      return sfdAccounts;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    sfdAccounts: data || [],
    isLoading,
    isError,
    refetch
  };
}
