
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSfdAdmins, SfdAdmin } from './sfdAdminApiService';
import { useAddSfdAdmin } from './useAddSfdAdmin';

export function useSfdAdminManagement() {
  const { addSfdAdmin, isAdding, error: addError } = useAddSfdAdmin();
  
  // Get list of SFD admins
  const { 
    data: sfdAdmins = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfd-admins'],
    queryFn: async () => {
      try {
        console.log('Loading SFD admins via useSfdAdminManagement...');
        const data = await getSfdAdmins();
        console.log('Loaded SFD admins:', data);
        return data;
      } catch (err) {
        console.error('Error in useSfdAdminManagement:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    sfdAdmins: Array.isArray(sfdAdmins) ? sfdAdmins : [],
    isLoading,
    error,
    refetch,
    addSfdAdmin,
    isAdding,
    addError
  };
}
