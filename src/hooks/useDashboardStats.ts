import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardStats {
  clients: {
    total: number;
    newThisMonth: number;
  };
  loans: {
    active: number;
    pending: number;
  };
  subsidyRequests: {
    total: number;
    pending: number;
  };
  activeSfds?: number;
  newSfdsThisMonth?: number;
  admins?: number;
  newAdminsThisMonth?: number;
  totalUsers?: number;
  newUsersThisMonth?: number;
  newSubsidiesThisMonth?: string | number;
}

export const useDashboardStats = () => {
  const { user, activeSfdId } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    clients: { total: 0, newThisMonth: 0 },
    loans: { active: 0, pending: 0 },
    subsidyRequests: { total: 0, pending: 0 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSfdDashboardStats = async () => {
      if (!activeSfdId) return;
      
      try {
        setIsLoading(true);
        
        // Get the first day of the current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Fetch client stats
        const { count: totalClients, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId);
          
        if (clientsError) throw clientsError;
        
        // Count clients created this month
        const { count: newClientsThisMonth, error: newClientsError } = await supabase
          .from('sfd_clients')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId)
          .gte('created_at', firstDayOfMonth.toISOString());
          
        if (newClientsError) throw newClientsError;
        
        // Fetch loan stats
        const { count: activeLoans, error: loansError } = await supabase
          .from('sfd_loans')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId)
          .in('status', ['active', 'approved']);
          
        if (loansError) throw loansError;
        
        // Fetch pending loans
        const { count: pendingLoans, error: pendingLoansError } = await supabase
          .from('sfd_loans')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId)
          .eq('status', 'pending');
          
        if (pendingLoansError) throw pendingLoansError;
        
        // Fetch subsidy requests stats
        const { count: totalSubsidyRequests, error: subsidyRequestsError } = await supabase
          .from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId);
          
        if (subsidyRequestsError) throw subsidyRequestsError;
        
        // Fetch pending subsidy requests
        const { count: pendingSubsidyRequests, error: pendingSubsidyRequestsError } = await supabase
          .from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId)
          .eq('status', 'pending');
          
        if (pendingSubsidyRequestsError) throw pendingSubsidyRequestsError;
        
        // Update the stats state
        setStats({
          clients: {
            total: totalClients || 0,
            newThisMonth: newClientsThisMonth || 0
          },
          loans: {
            active: activeLoans || 0,
            pending: pendingLoans || 0
          },
          subsidyRequests: {
            total: totalSubsidyRequests || 0,
            pending: pendingSubsidyRequests || 0
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching SFD dashboard stats:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchSfdDashboardStats();
    
    // Set up a real-time subscription for active updates
    if (activeSfdId) {
      const subscription = supabase
        .channel('sfd-dashboard-stats')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sfd_clients',
          filter: `sfd_id=eq.${activeSfdId}`
        }, fetchSfdDashboardStats)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sfd_loans',
          filter: `sfd_id=eq.${activeSfdId}`
        }, fetchSfdDashboardStats)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'subsidy_requests',
          filter: `sfd_id=eq.${activeSfdId}`
        }, fetchSfdDashboardStats)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'sfd_loans',
          filter: `sfd_id=eq.${activeSfdId}`
        }, fetchSfdDashboardStats)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'subsidy_requests',
          filter: `sfd_id=eq.${activeSfdId}`
        }, fetchSfdDashboardStats)
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeSfdId]);

  return { stats, isLoading, error };
};
