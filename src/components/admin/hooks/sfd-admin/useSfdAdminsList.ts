
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins } from './sfdAdminApiService';

export function useSfdAdminsList() {
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      try {
        setError(null);
        return await fetchSfdAdmins();
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors de la récupération des administrateurs SFD");
        throw err;
      }
    }
  });

  return {
    sfdAdmins: data || [],
    isLoading,
    error,
    refetch
  };
}
