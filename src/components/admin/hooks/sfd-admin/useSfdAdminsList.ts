
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins, fetchSfdAdminsForSfd } from './sfdAdminApiService';

export function useSfdAdminsList(sfdId?: string) {
  const {
    data: sfdAdmins,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: sfdId ? ['sfd-admins', sfdId] : ['sfd-admins'],
    queryFn: () => sfdId ? fetchSfdAdminsForSfd(sfdId) : fetchSfdAdmins(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    sfdAdmins,
    isLoading,
    error,
    refetch
  };
}
