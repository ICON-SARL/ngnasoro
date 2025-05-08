
import { useQuery } from '@tanstack/react-query';
import { fetchUserSfds } from './fetchSfdAccounts';
import { SfdAccount, SfdClientAccount } from './types';
import { User } from '@/hooks/auth/types';

export function useSfdList(user: User | null) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching SFDs for user:', user.id);
      const userSfds = await fetchUserSfds(user.id);
      console.log('Fetched SFDs:', userSfds);
      
      // Transformer toutes les SFDs en objets SfdAccount
      const sfdAccounts: SfdClientAccount[] = userSfds.map(userSfd => ({
        id: userSfd.id,
        name: userSfd.name,
        code: userSfd.code,
        region: userSfd.region || '',
        logoUrl: userSfd.logo_url,
        logo_url: userSfd.logo_url,
        balance: 0, // Le solde sera récupéré séparément
        currency: 'FCFA',
        isDefault: false,
        isVerified: true,
        status: userSfd.status || 'active',
        sfd_id: userSfd.id,
        account_type: 'main',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
