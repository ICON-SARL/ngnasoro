
import { useQuery } from '@tanstack/react-query';
import { fetchUserSfds } from './fetchSfdAccounts';
import { User } from '@/hooks/auth/types';

export function useSfdList(user: User | null) {
  const query = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return fetchUserSfds(user.id);
    },
    enabled: !!user?.id,
  });

  return {
    sfdAccounts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
