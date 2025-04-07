
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSfdAdmins } from './sfdAdminApiService';

export function useSfdAdminsList() {
  const [error, setError] = useState<string | null>(null);

  const {
    data: sfdAdmins,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      try {
        setError(null);
        return await fetchSfdAdmins();
      } catch (err: any) {
        console.error('Error fetching SFD admins:', err);
        setError(err.message);
        return [];
      }
    },
  });

  return {
    sfdAdmins,
    isLoading,
    error,
    refetch
  };
}
