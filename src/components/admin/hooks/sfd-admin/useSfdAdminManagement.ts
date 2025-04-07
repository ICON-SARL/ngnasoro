
import { useState } from 'react';
import { useSfdAdminsList } from './useSfdAdminsList';
import { useAddSfdAdmin } from './useAddSfdAdmin';
import { useDeleteSfdAdmin } from './useDeleteSfdAdmin';

export function useSfdAdminManagement() {
  const { sfdAdmins, isLoading: isLoadingAdmins, error: listError, refetch } = useSfdAdminsList();
  const { addSfdAdmin, isAdding, error: addError } = useAddSfdAdmin();
  const { deleteSfdAdmin, isDeleting, error: deleteError } = useDeleteSfdAdmin();
  
  // Combine the isLoading states
  const isLoading = isLoadingAdmins || isAdding || isDeleting;
  
  // Combine errors (use the most recent/relevant one)
  const error = addError || deleteError || listError;
  
  return {
    // Admin list data and operations
    sfdAdmins,
    isLoading,
    error,
    refetchAdmins: refetch,
    
    // Admin creation
    addSfdAdmin,
    
    // Admin deletion
    deleteSfdAdmin
  };
}
