
import { edgeFunctionApi } from './edgeFunctionApi';
import { useToast } from '@/hooks/use-toast';

/**
 * API service for communication with SFD admin and super admin backends
 */
export const adminCommunicationApi = {
  /**
   * Fetch SFD account data from admin backend
   * @param userId User ID
   * @param sfdId SFD ID
   */
  async fetchSfdAccountData(userId: string, sfdId: string) {
    return edgeFunctionApi.callEdgeFunction('admin-api-gateway', {
      endpoint: `/accounts/${userId}/sfd/${sfdId}`,
      method: 'GET'
    });
  },
  
  /**
   * Synchronize user accounts with SFD backend
   * @param userId User ID
   * @param sfdId Optional SFD ID to sync a specific SFD
   * @param forceSync Force synchronization even if data is recent
   */
  async synchronizeAccounts(userId: string, sfdId?: string, forceSync: boolean = false) {
    return edgeFunctionApi.callEdgeFunction('synchronize-sfd-accounts', {
      userId,
      sfdId,
      forceSync
    });
  },
  
  /**
   * Report synchronization error to admin
   * @param userId User ID
   * @param sfdId SFD ID where the error occurred
   * @param errorMessage Error message
   * @param errorStack Error stack trace if available
   */
  async reportSyncError(userId: string, sfdId: string, errorMessage: string, errorStack?: string) {
    return edgeFunctionApi.callEdgeFunction('admin-api-gateway', {
      endpoint: '/support/sync-error',
      method: 'POST',
      data: {
        userId,
        sfdId,
        errorMessage,
        errorStack,
        timestamp: new Date().toISOString()
      }
    }, { showToast: false });
  },
  
  /**
   * Get account status from admin backend
   * @param userId User ID
   * @param sfdId SFD ID
   */
  async getAccountStatus(userId: string, sfdId: string) {
    return edgeFunctionApi.callEdgeFunction('admin-api-gateway', {
      endpoint: `/accounts/${userId}/status`,
      method: 'GET',
      params: { sfdId }
    });
  },
  
  /**
   * Ping admin server to check connectivity
   */
  async pingAdminServer() {
    return edgeFunctionApi.callEdgeFunction('admin-api-gateway', {
      endpoint: '/ping',
      method: 'GET'
    }, { 
      showToast: false,
      timeout: 5000 // Short timeout for ping
    });
  }
};

/**
 * Hook for admin communication with error handling
 */
export function useAdminCommunication() {
  const { toast } = useToast();
  
  /**
   * Attempt to synchronize account with error handling
   */
  const syncWithErrorHandling = async (userId: string, sfdId?: string) => {
    try {
      const result = await adminCommunicationApi.synchronizeAccounts(userId, sfdId, true);
      
      if (result.success) {
        return {
          success: true,
          message: "Synchronisation réussie",
          data: result.data
        };
      } else {
        // Handle known error conditions
        toast({
          title: "Erreur de synchronisation",
          description: result.message || "Impossible de synchroniser les comptes",
          variant: "destructive",
        });
        
        return {
          success: false,
          message: result.message || "Échec de la synchronisation",
          error: result.error
        };
      }
    } catch (error: any) {
      // Log error to admin backend
      if (userId && sfdId) {
        adminCommunicationApi.reportSyncError(
          userId, 
          sfdId, 
          error.message || "Unknown error", 
          error.stack
        ).catch(() => {
          // Silent failure for error reporting
        });
      }
      
      toast({
        title: "Erreur de communication",
        description: "Impossible de contacter le serveur SFD. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
        error
      };
    }
  };
  
  return {
    syncWithErrorHandling,
    ...adminCommunicationApi
  };
}
