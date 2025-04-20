
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SfdStatistics {
  clientsTotal: number;
  clientsNewThisMonth: number;
  activeLoans: number;
  pendingApprovalLoans: number;
  subsidyRequests: number;
  pendingSubsidyRequests: number;
  totalDisbursed: number;
  outstandingBalance: number;
  lastUpdate: string;
}

export function useSfdStatistics() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sfd-statistics'],
    queryFn: async (): Promise<SfdStatistics> => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // Get SFD ID associated with the current admin
        const { data: userSfds, error: sfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (sfdsError) throw sfdsError;
        
        if (!userSfds || userSfds.length === 0) {
          console.error('No SFD associated with this admin user');
          return {
            clientsTotal: 0,
            clientsNewThisMonth: 0,
            activeLoans: 0,
            pendingApprovalLoans: 0,
            subsidyRequests: 0,
            pendingSubsidyRequests: 0,
            totalDisbursed: 0,
            outstandingBalance: 0,
            lastUpdate: new Date().toISOString()
          };
        }
        
        const sfdId = userSfds[0].sfd_id;
        
        // Fetch clients statistics
        const { data: clients, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, created_at')
          .eq('sfd_id', sfdId);
          
        if (clientsError) throw clientsError;
        
        // Calculate new clients this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newClients = clients?.filter(client => 
          new Date(client.created_at) >= startOfMonth
        ) || [];
        
        // Fetch loans statistics
        const { data: loans, error: loansError } = await supabase
          .from('sfd_loans')
          .select('id, status, amount')
          .eq('sfd_id', sfdId);
          
        if (loansError) throw loansError;
        
        const activeLoans = loans?.filter(loan => loan.status === 'active') || [];
        const pendingLoans = loans?.filter(loan => loan.status === 'pending') || [];
        
        // Fetch subsidy requests statistics
        const { data: subsidyRequests, error: subsidyError } = await supabase
          .from('subsidy_requests')
          .select('id, status')
          .eq('sfd_id', sfdId);
          
        if (subsidyError) throw subsidyError;
        
        const pendingSubsidies = subsidyRequests?.filter(req => req.status === 'pending') || [];
        
        // Calculate total disbursed and outstanding balance
        const totalDisbursed = activeLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
        
        // Return aggregated statistics
        return {
          clientsTotal: clients?.length || 0,
          clientsNewThisMonth: newClients.length,
          activeLoans: activeLoans.length,
          pendingApprovalLoans: pendingLoans.length,
          subsidyRequests: subsidyRequests?.length || 0,
          pendingSubsidyRequests: pendingSubsidies.length,
          totalDisbursed,
          outstandingBalance: totalDisbursed * 0.8, // Estimated outstanding balance
          lastUpdate: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching SFD statistics:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });
}
