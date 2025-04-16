
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SfdStatistics {
  clientsTotal: number;
  clientsNewThisMonth: number;
  activeLoans: number;
  pendingApprovalLoans: number;
  subsidyRequests: number;
  pendingSubsidyRequests: number;
}

export const useSfdStatistics = (sfdId?: string) => {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  
  // Use the provided sfdId if available, otherwise use activeSfdId from auth context
  const targetSfdId = sfdId || activeSfdId;

  return useQuery({
    queryKey: ['sfd-statistics', targetSfdId],
    queryFn: async (): Promise<SfdStatistics> => {
      if (!targetSfdId) {
        throw new Error("Aucune SFD sélectionnée");
      }

      try {
        // Get current month date range
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Get total clients
        const { count: totalClients, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId);

        if (clientsError) throw clientsError;

        // Get new clients this month
        const { count: newClients, error: newClientsError } = await supabase
          .from('sfd_clients')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId)
          .gte('created_at', firstDayOfMonth);

        if (newClientsError) throw newClientsError;

        // Get active loans count
        const { count: activeLoans, error: activeLoansError } = await supabase
          .from('sfd_loans')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId)
          .eq('status', 'active');

        if (activeLoansError) throw activeLoansError;

        // Get pending approval loans count
        const { count: pendingLoans, error: pendingLoansError } = await supabase
          .from('sfd_loans')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId)
          .eq('status', 'pending');

        if (pendingLoansError) throw pendingLoansError;

        // Get subsidy requests count
        const { count: subsidyRequests, error: subsidyError } = await supabase
          .from('subsidy_requests')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId);

        if (subsidyError) throw subsidyError;

        // Get pending subsidy requests count
        const { count: pendingSubsidies, error: pendingSubsidyError } = await supabase
          .from('subsidy_requests')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', targetSfdId)
          .eq('status', 'pending');

        if (pendingSubsidyError) throw pendingSubsidyError;

        return {
          clientsTotal: totalClients || 0,
          clientsNewThisMonth: newClients || 0,
          activeLoans: activeLoans || 0,
          pendingApprovalLoans: pendingLoans || 0,
          subsidyRequests: subsidyRequests || 0,
          pendingSubsidyRequests: pendingSubsidies || 0
        };
      } catch (error: any) {
        console.error('Error fetching SFD statistics:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les statistiques",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!targetSfdId,
  });
};
