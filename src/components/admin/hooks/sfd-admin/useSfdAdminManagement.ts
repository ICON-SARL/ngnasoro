
import { useAddSfdAdmin } from './useAddSfdAdmin';
import { useDeleteSfdAdmin } from './useDeleteSfdAdmin';
import { useSfdAdminsList } from './useSfdAdminsList';

/**
 * Combined hook for managing SFD administrators
 */
export function useSfdAdminManagement() {
  const { addSfdAdmin, isAdding, error: addError } = useAddSfdAdmin();
  const { deleteSfdAdmin, isDeleting, error: deleteError } = useDeleteSfdAdmin();
  const { sfdAdmins, isLoading: isLoadingList, error: listError, refetch } = useSfdAdminsList();

  return {
    // List operations
    sfdAdmins,
    refetch,
    
    // Add operations
    addSfdAdmin,
    
    // Delete operations
    deleteSfdAdmin,
    
    // Loading states
    isLoading: isLoadingList || isAdding || isDeleting,
    
    // Error states
    error: addError || deleteError || listError
  };
}
