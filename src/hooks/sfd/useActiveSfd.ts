
import { useQuery } from '@tanstack/react-query';
import { User } from '@/hooks/auth/types';
import { fetchSfdBalance } from './fetchSfdBalance';
import { fetchSfdLoans } from './fetchSfdLoans';
import { fetchUserSfds } from './fetchSfdAccounts';
import { useToast } from '@/hooks/use-toast';

export function useActiveSfd(user: User | null, activeSfdId: string | null) {
  const { toast } = useToast();
  
  const activeSfdQuery = useQuery({
    queryKey: ['active-sfd', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return null;
      
      // Get basic SFD info
      const sfdsList = await fetchUserSfds(user.id);
      const activeSfd = sfdsList.find(sfd => sfd.id === activeSfdId);
      
      if (!activeSfd) {
        console.error('Active SFD not found for this user');
        return null;
      }
      
      try {
        // Get balance data
        const balanceData = await fetchSfdBalance(user.id, activeSfdId);
        
        // Get loans data
        const loansData = await fetchSfdLoans(user.id, activeSfdId);
        
        return {
          id: activeSfd.id,
          name: activeSfd.name,
          logoUrl: activeSfd.logo_url,
          region: activeSfd.region || '',
          code: activeSfd.code,
          isDefault: false, // Default value since it's not available in the current data structure
          balance: balanceData.balance,
          currency: balanceData.currency,
          loans: loansData
        };
      } catch (error) {
        console.error('Failed to fetch SFD account details:', error);
        toast({
          title: 'Erreur de synchronisation',
          description: 'Impossible de synchroniser les données avec votre SFD',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!user?.id && !!activeSfdId,
  });
  
  return {
    activeSfdAccount: activeSfdQuery.data,
    isLoading: activeSfdQuery.isLoading,
    isError: activeSfdQuery.isError,
    refetch: activeSfdQuery.refetch
  };
}
