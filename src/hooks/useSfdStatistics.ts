
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SfdStatistics {
  clientsTotal: number;
  clientsNewThisMonth: number;
  activeLoans: number;
  pendingApprovalLoans: number;
  subsidyRequests: number;
  pendingSubsidyRequests: number;
}

export const useSfdStatistics = (sfdId?: string) => {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const effectiveSfdId = sfdId || activeSfdId;

  const fetchSfdStatistics = async (): Promise<SfdStatistics> => {
    if (!effectiveSfdId) {
      throw new Error("Aucune SFD sélectionnée");
    }

    try {
      console.log(`Fetching statistics for SFD ID: ${effectiveSfdId}`);
      
      // Get current month date range
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Fetch total clients and new clients this month
      const { data: clients, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id, created_at')
        .eq('sfd_id', effectiveSfdId);
        
      if (clientsError) throw clientsError;
      
      const clientsTotal = clients?.length || 0;
      const clientsNewThisMonth = clients?.filter(
        client => new Date(client.created_at) >= new Date(firstDayOfMonth)
      ).length || 0;
      
      // Fetch active loans
      const { data: activeLoans, error: loansError } = await supabase
        .from('sfd_loans')
        .select('id, status')
        .eq('sfd_id', effectiveSfdId)
        .in('status', ['active', 'approved', 'disbursed']);
        
      if (loansError) throw loansError;
      
      // Fetch pending approval loans
      const { data: pendingLoans, error: pendingLoansError } = await supabase
        .from('sfd_loans')
        .select('id')
        .eq('sfd_id', effectiveSfdId)
        .eq('status', 'pending');
        
      if (pendingLoansError) throw pendingLoansError;
      
      // Fetch subsidy requests
      const { data: subsidyRequests, error: subsidyRequestsError } = await supabase
        .from('subsidy_requests')
        .select('id, status')
        .eq('sfd_id', effectiveSfdId);
        
      if (subsidyRequestsError) throw subsidyRequestsError;
      
      const pendingSubsidyRequests = subsidyRequests?.filter(
        request => request.status === 'pending'
      ).length || 0;
      
      return {
        clientsTotal,
        clientsNewThisMonth,
        activeLoans: activeLoans?.length || 0,
        pendingApprovalLoans: pendingLoans?.length || 0,
        subsidyRequests: subsidyRequests?.length || 0,
        pendingSubsidyRequests
      };
    } catch (error: any) {
      console.error('Error fetching SFD statistics:', error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les statistiques: ${error.message}`,
        variant: "destructive",
      });
      
      // Return placeholder data on error
      return {
        clientsTotal: 0,
        clientsNewThisMonth: 0,
        activeLoans: 0,
        pendingApprovalLoans: 0,
        subsidyRequests: 0,
        pendingSubsidyRequests: 0
      };
    }
  };

  return useQuery({
    queryKey: ['sfd-statistics', effectiveSfdId],
    queryFn: fetchSfdStatistics,
    enabled: !!effectiveSfdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
