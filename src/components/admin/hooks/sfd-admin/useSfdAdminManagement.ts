
import { useState } from 'react';
import { useSfdAdminsList } from './useSfdAdminsList';
import { useAddSfdAdmin } from './useAddSfdAdmin';
import { useDeleteSfdAdmin } from './useDeleteSfdAdmin';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';

export function useSfdAdminManagement() {
  const { sfdAdmins, isLoading: isLoadingAdmins, error: listError, refetch } = useSfdAdminsList();
  const { addSfdAdmin, isAdding, error: addError } = useAddSfdAdmin();
  const { deleteSfdAdmin, isDeleting, error: deleteError } = useDeleteSfdAdmin();
  const { sendNotification } = useAdminCommunication();
  
  // Combine the isLoading states
  const isLoading = isLoadingAdmins || isAdding || isDeleting;
  
  // Combine errors (use the most recent/relevant one)
  const error = addError || deleteError || listError;
  
  // Enhanced addSfdAdmin function that handles notifications
  const enhancedAddSfdAdmin = (
    data: any, 
    options?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    // Call the original addSfdAdmin function
    return addSfdAdmin(data, {
      ...options,
      onSuccess: (result: any) => {
        // If notification flag is set and we have a user ID
        if (data.notify && result?.user_id) {
          try {
            sendNotification({
              title: "Compte administrateur SFD créé",
              message: `Un compte administrateur a été créé pour vous. Veuillez vous connecter avec l'email ${data.email}.`,
              type: "info",
              recipient_id: result.user_id
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
    // Admin list data and operations
    sfdAdmins,
    isLoading,
    error,
    refetchAdmins: refetch,
    
    // Admin creation
    addSfdAdmin: enhancedAddSfdAdmin,
    
    // Admin deletion
    deleteSfdAdmin
  };
}
