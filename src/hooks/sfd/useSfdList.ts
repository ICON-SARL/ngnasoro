
import { useQuery } from '@tanstack/react-query';
import { fetchUserSfds } from './fetchSfdAccounts';
import { SfdAccount, SfdClientAccount } from './types';
import type { User } from '@/hooks/auth/types';

export function useSfdList(user: User | null) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const userSfds = await fetchUserSfds(user.id);
      
      // Transform UserSfd objects into SfdAccount objects
      const sfdAccounts: SfdClientAccount[] = userSfds.map(userSfd => ({
        id: userSfd.sfds.id,
        name: userSfd.sfds.name,
        code: userSfd.sfds.code,
        region: userSfd.sfds.region,
        logoUrl: userSfd.sfds.logo_url,
        balance: 0, // This will be fetched separately
        currency: 'FCFA',
        isDefault: userSfd.is_default,
        isVerified: true, // Default is verified
        status: 'active',
        sfd_id: userSfd.sfds.id, // Set sfd_id equal to id for compatibility
        account_type: 'main'
      }));
      
      return sfdAccounts;
    },
    enabled: !!user?.id,
  });

  return {
    sfdAccounts: data || [],
    isLoading,
    isError,
    refetch
  };
}
