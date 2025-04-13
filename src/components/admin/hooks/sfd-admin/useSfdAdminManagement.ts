
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSfdAdmins, SfdAdmin } from './sfdAdminApiService';

export function useSfdAdminManagement() {
  // Get list of SFD admins
  const { data: sfdAdmins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      const data = await getSfdAdmins();
      return data;
    }
  });

  return {
    sfdAdmins,
    isLoading,
    error,
    refetch
  };
}
