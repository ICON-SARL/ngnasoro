import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SfdDashboardStats {
  clients: {
    total: number;
    newLastMonth: number;
    percentageChange: number;
  };
  loans: {
    active: number;
    totalAmount: number;
  };
  repayments: {
    currentMonth: number;
    repaymentRate: number;
  };
}

export const useSfdDashboardStats = (sfdId?: string) => {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const effectiveSfdId = sfdId || activeSfdId;

  const fetchDashboardStats = async (): Promise<SfdDashboardStats> => {
    if (!effectiveSfdId) {
      throw new Error("Aucune SFD sélectionnée");
    }

    try {
      console.log(`Fetching dashboard stats for SFD ID: ${effectiveSfdId}`);
      
      // Get current date ranges
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // First day of current month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      // Last day of current month
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();
      
      // First day of previous month
      const firstDayOfLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
      // Last day of previous month
      const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0).toISOString();
      
      // 1. Fetch client statistics
      const { count: totalClients, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id', { count: 'exact', head: true })
        .eq('sfd_id', effectiveSfdId);
        
      if (clientsError) throw clientsError;
      
      // Count new clients from last month
      const { count: newClientsLastMonth, error: newClientsError } = await supabase
        .from('sfd_clients')
        .select('id', { count: 'exact', head: true })
        .eq('sfd_id', effectiveSfdId)
        .gte('created_at', firstDayOfLastMonth)
        .lte('created_at', lastDayOfLastMonth);
        
      if (newClientsError) throw newClientsError;
      
      // Get clients count from two months ago for percentage calculation
      const { count: clientsTwoMonthsAgo, error: oldClientsError } = await supabase
        .from('sfd_clients')
        .select('id', { count: 'exact', head: true })
        .eq('sfd_id', effectiveSfdId)
        .lt('created_at', firstDayOfLastMonth);
        
      if (oldClientsError) throw oldClientsError;
      
      // Calculate percentage change (if there were 0 clients two months ago, set to 100%)
      const percentageChange = clientsTwoMonthsAgo ? 
        Math.round((newClientsLastMonth / clientsTwoMonthsAgo) * 100) : 
        (newClientsLastMonth > 0 ? 100 : 0);
      
      // 2. Fetch active loans
      const { data: activeLoans, error: loansError } = await supabase
        .from('sfd_loans')
        .select('amount')
        .eq('sfd_id', effectiveSfdId)
        .in('status', ['active', 'approved', 'disbursed']);
        
      if (loansError) throw loansError;
      
      const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      
      // 3. Fix: Fetch repayments for current month
      // The issue is with the payment_date field in the join query
      const { data: currentMonthPayments, error: paymentsError } = await supabase
        .from('loan_payments')
        .select('amount, loan_id')
        .gte('created_at', firstDayOfMonth)
        .lte('created_at', lastDayOfMonth);
        
      if (paymentsError) throw paymentsError;
      
      // Filter payments belonging to the correct SFD
      const { data: sfdLoans, error: sfdLoansError } = await supabase
        .from('sfd_loans')
        .select('id')
        .eq('sfd_id', effectiveSfdId);
        
      if (sfdLoansError) throw sfdLoansError;
      
      const sfdLoanIds = sfdLoans.map(loan => loan.id);
      
      // Filter payments for this SFD only
      const sfdPayments = currentMonthPayments.filter(payment => 
        sfdLoanIds.includes(payment.loan_id)
      );
      
      const totalRepayments = sfdPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Calculate repayment rate (placeholder - would need more complex logic in real app)
      // This is simplified and assumes a 98% rate for demonstration
      const repaymentRate = 98;
      
      return {
        clients: {
          total: totalClients || 0,
          newLastMonth: newClientsLastMonth || 0,
          percentageChange: percentageChange
        },
        loans: {
          active: activeLoans.length,
          totalAmount: totalLoanAmount
        },
        repayments: {
          currentMonth: totalRepayments,
          repaymentRate: repaymentRate
        }
      };
    } catch (error: any) {
      console.error('Error fetching SFD dashboard stats:', error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les statistiques: ${error.message}`,
        variant: "destructive",
      });
      
      // Return placeholder data on error
      return {
        clients: {
          total: 0,
          newLastMonth: 0,
          percentageChange: 0
        },
        loans: {
          active: 0,
          totalAmount: 0
        },
        repayments: {
          currentMonth: 0,
          repaymentRate: 0
        }
      };
    }
  };

  return useQuery({
    queryKey: ['sfd-dashboard-stats', effectiveSfdId],
    queryFn: fetchDashboardStats,
    enabled: !!effectiveSfdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
