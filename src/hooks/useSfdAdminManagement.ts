
import { useSfdAdminManagement as useOriginalSfdAdminManagement } from '@/components/admin/hooks/sfd-admin/useSfdAdminManagement';
export type { SfdAdmin } from '@/components/admin/hooks/sfd-admin/sfdAdminApiService';

/**
 * Hook for managing SFD administrators
 * This file re-exports from the new location to maintain backward compatibility
 */
export function useSfdAdminManagement() {
  const { isLoading, error, addSfdAdmin } = useOriginalSfdAdminManagement();
  
  return {
    isLoading,
    error,
    addSfdAdmin
  };
}
