
import { supabase } from '@/integrations/supabase/client';

export interface SfdDashboardData {
  clientCount: number;
  newClientsThisMonth: number;
  activeLoans: number;
  pendingLoans: number;
  subsidyRequests: number;
  pendingSubsidyRequests: number;
}

export interface MerefDashboardData {
  activeSfds: number;
  pendingRequests: number;
  totalAmount: number;
  amountUsed: number;
}

export const dashboardDataService = {
  /**
   * Get dashboard data for an SFD agency
   */
  async getSfdDashboardData(sfdId: string): Promise<SfdDashboardData> {
    try {
      if (!sfdId) throw new Error('SFD ID is required');
      
      // Get the first day of the current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Run queries in parallel
      const [
        clientsResult,
        newClientsResult,
        activeLoansResult,
        pendingLoansResult,
        subsidyRequestsResult,
        pendingSubsidyRequestsResult
      ] = await Promise.all([
        // Total clients count
        supabase.from('sfd_clients')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId),
        
        // New clients this month count
        supabase.from('sfd_clients')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId)
          .gte('created_at', firstDayOfMonth.toISOString()),
        
        // Active loans count
        supabase.from('sfd_loans')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId)
          .in('status', ['active', 'approved']),
        
        // Pending loans count
        supabase.from('sfd_loans')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId)
          .eq('status', 'pending'),
        
        // Total subsidy requests count
        supabase.from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId),
        
        // Pending subsidy requests count
        supabase.from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', sfdId)
          .eq('status', 'pending')
      ]);
      
      // Handle any errors
      if (clientsResult.error) throw clientsResult.error;
      if (newClientsResult.error) throw newClientsResult.error;
      if (activeLoansResult.error) throw activeLoansResult.error;
      if (pendingLoansResult.error) throw pendingLoansResult.error;
      if (subsidyRequestsResult.error) throw subsidyRequestsResult.error;
      if (pendingSubsidyRequestsResult.error) throw pendingSubsidyRequestsResult.error;
      
      // Return the consolidated data
      return {
        clientCount: clientsResult.count || 0,
        newClientsThisMonth: newClientsResult.count || 0,
        activeLoans: activeLoansResult.count || 0,
        pendingLoans: pendingLoansResult.count || 0,
        subsidyRequests: subsidyRequestsResult.count || 0,
        pendingSubsidyRequests: pendingSubsidyRequestsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching SFD dashboard data:', error);
      // Return default values on error
      return {
        clientCount: 0,
        newClientsThisMonth: 0,
        activeLoans: 0,
        pendingLoans: 0,
        subsidyRequests: 0,
        pendingSubsidyRequests: 0
      };
    }
  },
  
  /**
   * Get dashboard data for MEREF admin
   */
  async getMerefDashboardData(): Promise<MerefDashboardData> {
    try {
      // Run queries in parallel
      const [
        activeSfdsResult,
        pendingRequestsResult,
        subsidiesResult
      ] = await Promise.all([
        // Count active SFDs
        supabase.from('sfds')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Count pending subsidy requests
        supabase.from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Get subsidy amounts data
        supabase.from('sfd_subsidies')
          .select('amount, used_amount')
      ]);
      
      // Handle any errors
      if (activeSfdsResult.error) throw activeSfdsResult.error;
      if (pendingRequestsResult.error) throw pendingRequestsResult.error;
      if (subsidiesResult.error) throw subsidiesResult.error;
      
      // Calculate total and used subsidy amounts
      const totalAmount = subsidiesResult.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const amountUsed = subsidiesResult.data?.reduce((sum, item) => sum + (item.used_amount || 0), 0) || 0;
      
      // Return the consolidated data
      return {
        activeSfds: activeSfdsResult.count || 0,
        pendingRequests: pendingRequestsResult.count || 0,
        totalAmount,
        amountUsed
      };
    } catch (error) {
      console.error('Error fetching MEREF dashboard data:', error);
      // Return default values on error
      return {
        activeSfds: 0,
        pendingRequests: 0,
        totalAmount: 0,
        amountUsed: 0
      };
    }
  }
};
