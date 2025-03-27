
import { supabase } from '@/integrations/supabase/client';

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
   */
  async getSubsidies(
    params: PaginationParams & DateFilter & SfdFilter = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/subsidies',
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
   */
  async getSubsidyRequests(
    params: PaginationParams & DateFilter & SfdFilter & { status?: string, priority?: string } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/subsidy-requests',
          ...params
        }),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subsidy requests:', error);
      throw error;
    }
  }
};
