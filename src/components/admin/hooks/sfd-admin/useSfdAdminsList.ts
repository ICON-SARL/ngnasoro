
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins } from './sfdAdminApiService';

export function useSfdAdminsList() {
  const { 
    data: sfdAdmins, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: fetchSfdAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    sfdAdmins: sfdAdmins || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}
