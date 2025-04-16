
import { useSfdAdminManagement as useOriginalSfdAdminManagement } from '@/components/admin/hooks/sfd-admin/useSfdAdminManagement';
import { useAddSfdAdmin } from '@/components/admin/hooks/sfd-admin/useAddSfdAdmin';
export type { SfdAdmin } from '@/components/admin/hooks/sfd-admin/sfdAdminApiService';

/**
 * Hook for managing SFD administrators
 * This file re-exports from the new location to maintain backward compatibility
 */
export function useSfdAdminManagement() {
  const { sfdAdmins, isLoading, error, refetch } = useOriginalSfdAdminManagement();
  const { addSfdAdmin, isAdding, error: addError } = useAddSfdAdmin();
  
  return {
    sfdAdmins,
    isLoading,
    error,
    refetch,
    addSfdAdmin,
    isAdding,
    addError
  };
}
