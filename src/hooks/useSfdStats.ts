
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SfdStats {
  approvedCreditsCount: number;
  rejectedCreditsCount: number;
  approvedCreditsAmount: number;
  rejectedCreditsAmount: number;
  subsidyBalance: number;
  activeClientsCount: number;
  pendingClientsCount: number;
}

export function useSfdStats(sfdId?: string) {
  const { user, activeSfdId } = useAuth();
  const effectiveSfdId = sfdId || activeSfdId;
  
  // Fetch SFD statistics
  const fetchSfdStats = async (): Promise<SfdStats> => {
    if (!effectiveSfdId) {
      return {
        approvedCreditsCount: 0,
        rejectedCreditsCount: 0,
        approvedCreditsAmount: 0,
        rejectedCreditsAmount: 0,
        subsidyBalance: 0,
        activeClientsCount: 0,
        pendingClientsCount: 0
      };
    }
    
    // Get current month dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    // Fetch credits approved this month
    const { data: approvedCredits, error: approvedError } = await supabase
      .from('sfd_loans')
      .select('id, amount')
      .eq('sfd_id', effectiveSfdId)
      .eq('status', 'approved')
      .gte('approved_at', firstDayOfMonth)
      .lte('approved_at', lastDayOfMonth);
      
    if (approvedError) console.error('Error fetching approved credits:', approvedError);
    
    // Fetch credits rejected this month
    const { data: rejectedCredits, error: rejectedError } = await supabase
      .from('sfd_loans')
      .select('id, amount')
      .eq('sfd_id', effectiveSfdId)
      .eq('status', 'rejected')
      .gte('created_at', firstDayOfMonth)
      .lte('created_at', lastDayOfMonth);
      
    if (rejectedError) console.error('Error fetching rejected credits:', rejectedError);
    
    // Fetch subsidy balance
    const { data: subsidies, error: subsidiesError } = await supabase
      .from('sfd_subsidies')
      .select('remaining_amount')
      .eq('sfd_id', effectiveSfdId)
      .eq('status', 'active');
      
    if (subsidiesError) console.error('Error fetching subsidies:', subsidiesError);
    
    // Fetch active clients count
    const { count: activeClientsCount, error: activeClientsError } = await supabase
      .from('sfd_clients')
      .select('id', { count: 'exact', head: true })
      .eq('sfd_id', effectiveSfdId)
      .eq('status', 'validated');
      
    if (activeClientsError) console.error('Error fetching active clients:', activeClientsError);
    
    // Fetch pending clients count
    const { count: pendingClientsCount, error: pendingClientsError } = await supabase
      .from('sfd_clients')
      .select('id', { count: 'exact', head: true })
      .eq('sfd_id', effectiveSfdId)
      .eq('status', 'pending');
      
    if (pendingClientsError) console.error('Error fetching pending clients:', pendingClientsError);
    
    // Calculate totals
    const approvedCreditsAmount = (approvedCredits || []).reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const rejectedCreditsAmount = (rejectedCredits || []).reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const subsidyBalance = (subsidies || []).reduce((sum, subsidy) => sum + (subsidy.remaining_amount || 0), 0);
    
    return {
      approvedCreditsCount: approvedCredits?.length || 0,
      rejectedCreditsCount: rejectedCredits?.length || 0,
      approvedCreditsAmount,
      rejectedCreditsAmount,
      subsidyBalance,
      activeClientsCount: activeClientsCount || 0,
      pendingClientsCount: pendingClientsCount || 0
    };
  };
  
  return useQuery({
    queryKey: ['sfd-stats', effectiveSfdId, new Date().getMonth(), new Date().getFullYear()],
    queryFn: fetchSfdStats,
    enabled: !!effectiveSfdId,
  });
}
