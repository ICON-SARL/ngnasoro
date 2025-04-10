
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins, fetchSfdAdminsForSfd } from './sfdAdminApiService';

export function useSfdAdminsList(sfdId?: string) {
  const { 
    data: sfdAdmins, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfd-admins', sfdId],
    queryFn: () => sfdId ? fetchSfdAdminsForSfd(sfdId) : fetchSfdAdmins(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    sfdAdmins: sfdAdmins || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}
