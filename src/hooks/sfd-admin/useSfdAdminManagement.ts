
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

  // Modified approach - pass the sendNotification function to addSfdAdmin through props
  // instead of using global variables
  const addSfdAdmin = (
    data: any, 
    options?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    // Call the addAdmin function with the data and options
    return addAdmin(data, {
      ...options,
      // This is where we'd handle sending notifications after successful admin creation
      onSuccess: () => {
        // If notify flag is set, send a notification
        if (data.notify && data.user_id) {
          try {
            sendNotification({
              title: "Compte administrateur SFD créé",
              message: `Un compte administrateur a été créé pour vous. Veuillez vous connecter avec l'email ${data.email}.`,
              type: "info",
              recipient_id: data.user_id
            });
          } catch (notifError) {
            console.warn("Unable to send notification:", notifError);
          }
        }
        
        // Call the original onSuccess if provided
        if (options?.onSuccess) {
          options.onSuccess();
        }
      }
    });
  };

  return {
    // Admin list data
    sfdAdmins,
    refetchAdmins: refetch,
    
    // Loading and error states
    isLoading,
    error,
    
    // Admin operations
    addSfdAdmin,
    updateSfdAdmin: updateAdmin,
    deleteSfdAdmin: deleteAdmin
  };
}
