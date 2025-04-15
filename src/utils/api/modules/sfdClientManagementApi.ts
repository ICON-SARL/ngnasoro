
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';

/**
 * API for SFD admins to manage clients with batch operations support
 */
export const sfdClientManagementApi = {
  /**
   * Get all clients for a specific SFD with optional filtering
   */
  getClients: async (sfdId: string, options?: {
    status?: string;
    searchTerm?: string;
    limit?: number;
    page?: number;
  }) => {
    try {
      let query = supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'getClients',
          sfdId,
          ...options
        }
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching SFD clients:', error);
      throw error;
    }
  },
  
  /**
   * Batch validate multiple client accounts at once
   */
  batchValidateClients: async ({
    clientIds,
    validatedBy,
    notes
  }: {
    clientIds: string[];
    validatedBy: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'batchValidateClients',
          clientIds,
          validatedBy,
          notes
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error batch validating clients:', error);
      throw error;
    }
  },
  
  /**
   * Batch reject multiple client accounts at once
   */
  batchRejectClients: async ({
    clientIds,
    validatedBy,
    rejectionReason
  }: {
    clientIds: string[];
    validatedBy: string;
    rejectionReason?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'batchRejectClients',
          clientIds,
          validatedBy,
          rejectionReason
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error batch rejecting clients:', error);
      throw error;
    }
  },
  
  /**
   * Import multiple clients from a CSV/JSON data structure
   */
  importClients: async ({
    sfdId,
    clients,
    importedBy
  }: {
    sfdId: string;
    clients: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level' | 'sfd_id'>[];
    importedBy: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'importClients',
          sfdId,
          clients,
          importedBy
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error importing clients:', error);
      throw error;
    }
  },
  
  /**
   * Export clients data for an SFD (with optional filters)
   */
  exportClients: async (sfdId: string, options?: {
    status?: string;
    format?: 'csv' | 'json';
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'exportClients',
          sfdId,
          ...options
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error exporting clients:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed analytics about client statuses, acquisition, etc.
   */
  getClientAnalytics: async (sfdId: string, period?: 'day' | 'week' | 'month' | 'year') => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'getClientAnalytics',
          sfdId,
          period: period || 'month'
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  }
};
