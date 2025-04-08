
import { useState } from 'react';
import { useAddSfdAdmin } from './useAddSfdAdmin';
import { useUpdateSfdAdmin } from './useUpdateSfdAdmin';
import { useDeleteSfdAdmin } from './useDeleteSfdAdmin';
import { useSfdAdminsList } from './useSfdAdminsList';
import { AdminNotificationRequest, useAdminCommunication } from '@/hooks/useAdminCommunication';

// This is the main hook that combines all the individual hooks
export function useSfdAdminManagement() {
  // Re-export the functionality from individual hooks
  const { sfdAdmins, isLoading: isLoadingAdmins, error: listError, refetch } = useSfdAdminsList();
  const { addSfdAdmin: addAdmin, isLoading: isAddingAdmin, error: addError } = useAddSfdAdmin();
  const { updateSfdAdmin: updateAdmin, isLoading: isUpdatingAdmin, error: updateError } = useUpdateSfdAdmin();
  const { deleteSfdAdmin: deleteAdmin, isLoading: isDeletingAdmin, error: deleteError } = useDeleteSfdAdmin();
  const { sendNotification } = useAdminCommunication();

  // Combine loading states
  const isLoading = isLoadingAdmins || isAddingAdmin || isUpdatingAdmin || isDeletingAdmin;
  
  // Combine errors (use the most recent/relevant one)
  const error = addError || updateError || deleteError || listError;

  // Export the sendNotification function to be used in useAddSfdAdmin
  global.sendNotification = sendNotification;

  return {
    // Admin list data
    sfdAdmins,
    refetchAdmins: refetch,
    
    // Loading and error states
    isLoading,
    error,
    
    // Admin operations
    addSfdAdmin: addAdmin,
    updateSfdAdmin: updateAdmin,
    deleteSfdAdmin: deleteAdmin
  };
}

// Make sendNotification globally available for the useAddSfdAdmin hook
declare global {
  var sendNotification: (notification: AdminNotificationRequest) => Promise<any>;
}
