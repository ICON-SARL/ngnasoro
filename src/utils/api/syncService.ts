
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

// Types for API responses and filters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface SfdFilter {
  sfdId?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  message?: string;
}

// Additional filter for audit logs
export interface AuditLogFilter {
  userId?: string;
  category?: string;
  severity?: string;
  status?: 'success' | 'failure';
}

// Main API Service
export const syncService = {
  /**
   * Fetch active SFDs
   */
  async getActiveSfds() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ endpoint: '/sfds' }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active SFDs:', error);
      throw error;
    }
  },
  
  /**
   * Fetch subsidies with pagination and filters
   * Only accessible to admin users
   */
  async getSubsidies(
    params: PaginationParams & DateFilter & SfdFilter = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/subsidies',
          requireAdmin: true,
          ...params
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subsidies:', error);
      throw error;
    }
  },
  
  /**
   * Fetch loans/credit requests with pagination and filters
   * Accessible to admin and sfd_admin users
   */
  async getLoans(
    params: PaginationParams & DateFilter & SfdFilter & { status?: string } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/loans',
          ...params
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  },
  
  /**
   * Fetch subsidy requests with pagination and filters
   * Only accessible to admin users
   */
  async getSubsidyRequests(
    params: PaginationParams & DateFilter & SfdFilter & { status?: string, priority?: string } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/subsidy-requests',
          requireAdmin: true,
          ...params
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subsidy requests:', error);
      throw error;
    }
  },
  
  /**
   * Fetch audit logs with pagination and filters
   * Only accessible to admin users
   */
  async getAuditLogs(
    params: PaginationParams & DateFilter & AuditLogFilter = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/audit-logs',
          requireAdmin: true,
          ...params
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },
  
  /**
   * Export audit logs as CSV
   * Only accessible to admin users
   */
  async exportAuditLogs(
    params: DateFilter & AuditLogFilter = {}
  ): Promise<Blob> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/audit-logs/export',
          requireAdmin: true,
          ...params
        }),
      });
      
      if (error) throw error;
      
      // Convert the data to a CSV blob
      const csvContent = data.csvContent;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  },
  
  /**
   * Apply for a loan - available to all authenticated users
   */
  async applyForLoan(loanData: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/apply-loan',
          method: 'POST',
          data: loanData
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error applying for loan:', error);
      throw error;
    }
  }
};

// Hook wrapper for the sync service that adds permission checks
export const useSyncService = () => {
  const { userRole } = useAuth();
  
  // Permission check utility
  const checkPermission = (requiredRole: string[]): boolean => {
    if (!userRole) return false;
    return requiredRole.includes(userRole);
  };
  
  return {
    ...syncService,
    
    // Override methods with permission checks
    getSubsidies: async (params: PaginationParams & DateFilter & SfdFilter = {}) => {
      if (!checkPermission(['admin'])) {
        throw new Error('Insufficient permissions: Only Super Admins can access subsidies');
      }
      return syncService.getSubsidies(params);
    },
    
    getSubsidyRequests: async (params: PaginationParams & DateFilter & SfdFilter & { status?: string, priority?: string } = {}) => {
      if (!checkPermission(['admin'])) {
        throw new Error('Insufficient permissions: Only Super Admins can access subsidy requests');
      }
      return syncService.getSubsidyRequests(params);
    },
    
    getAuditLogs: async (params: PaginationParams & DateFilter & AuditLogFilter = {}) => {
      if (!checkPermission(['admin'])) {
        throw new Error('Insufficient permissions: Only Super Admins can access audit logs');
      }
      return syncService.getAuditLogs(params);
    },
    
    exportAuditLogs: async (params: DateFilter & AuditLogFilter = {}) => {
      if (!checkPermission(['admin'])) {
        throw new Error('Insufficient permissions: Only Super Admins can export audit logs');
      }
      return syncService.exportAuditLogs(params);
    }
  };
};
