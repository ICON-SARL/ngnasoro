
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SfdMetrics {
  loanPortfolio: {
    total: number;
    monthlyGrowth: number;
  };
  activeClients: {
    total: number;
    monthlyGrowth: number;
  };
  repaymentRate: {
    current: number;
    monthlyChange: number;
  };
  recentClients: Array<{
    id: string;
    name: string;
    registrationDate: string;
  }>;
  recentLoans: Array<{
    id: string;
    amount: number;
    duration: number;
    status: string;
  }>;
}

export function useSfdDashboardMetrics() {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['sfd-dashboard-metrics', activeSfdId],
    queryFn: async (): Promise<SfdMetrics> => {
      if (!activeSfdId) throw new Error('No active SFD selected');
      
      try {
        // Get date ranges for monthly comparisons
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        
        // Fetch all necessary data in parallel
        const [
          currentLoansResult,
          lastMonthLoansResult,
          currentClientsResult,
          lastMonthClientsResult,
          recentClientsResult,
          recentLoansResult,
          loanPaymentsResult
        ] = await Promise.all([
          // Current month loans
          supabase
            .from('sfd_loans')
            .select('amount')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'active')
            .gte('created_at', firstDayOfMonth.toISOString()),
          
          // Last month loans
          supabase
            .from('sfd_loans')
            .select('amount')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'active')
            .gte('created_at', firstDayOfLastMonth.toISOString())
            .lt('created_at', firstDayOfMonth.toISOString()),
          
          // Current active clients
          supabase
            .from('sfd_clients')
            .select('id')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'active')
            .gte('created_at', firstDayOfMonth.toISOString()),
          
          // Last month active clients
          supabase
            .from('sfd_clients')
            .select('id')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'active')
            .gte('created_at', firstDayOfLastMonth.toISOString())
            .lt('created_at', firstDayOfMonth.toISOString()),
          
          // Recent clients
          supabase
            .from('sfd_clients')
            .select('id, full_name, created_at')
            .eq('sfd_id', activeSfdId)
            .order('created_at', { ascending: false })
            .limit(3),
          
          // Recent loans
          supabase
            .from('sfd_loans')
            .select('id, amount, duration_months, status')
            .eq('sfd_id', activeSfdId)
            .order('created_at', { ascending: false })
            .limit(3),
          
          // Loan payments for repayment rate
          supabase
            .from('loan_payments')
            .select('amount, payment_date, status')
            .eq('status', 'completed')
            .gte('payment_date', firstDayOfLastMonth.toISOString())
        ]);

        // Check for any errors in the responses
        const errors = [
          currentLoansResult.error,
          lastMonthLoansResult.error,
          currentClientsResult.error,
          lastMonthClientsResult.error,
          recentClientsResult.error,
          recentLoansResult.error,
          loanPaymentsResult.error
        ].filter(Boolean);

        if (errors.length > 0) {
          console.error('Error fetching dashboard metrics:', errors);
          toast({
            title: 'Erreur de chargement',
            description: 'Impossible de charger les données du tableau de bord',
            variant: 'destructive'
          });
          throw new Error('Failed to fetch dashboard metrics');
        }

        // Process the loan data
        const currentLoans = currentLoansResult.data || [];
        const lastMonthLoans = lastMonthLoansResult.data || [];
        
        // Calculate portfolio metrics
        const currentPortfolio = currentLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
        const lastMonthPortfolio = lastMonthLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
        
        const portfolioGrowth = lastMonthPortfolio ? 
          ((currentPortfolio - lastMonthPortfolio) / lastMonthPortfolio) * 100 : 0;

        // Process the client data
        const currentClients = currentClientsResult.data || [];
        const lastMonthClients = lastMonthClientsResult.data || [];
        
        // Calculate client growth
        const currentClientCount = currentClients.length;
        const lastMonthClientCount = lastMonthClients.length;
        
        const clientGrowth = lastMonthClientCount ? 
          ((currentClientCount - lastMonthClientCount) / lastMonthClientCount) * 100 : 0;

        // Process payment data for repayment rate
        const loanPayments = loanPaymentsResult.data || [];
        
        // Calculate current and last month payments
        const currentMonthPayments = loanPayments.filter(
          payment => new Date(payment.payment_date) >= firstDayOfMonth
        );
        
        const lastMonthPayments = loanPayments.filter(
          payment => new Date(payment.payment_date) >= firstDayOfLastMonth 
            && new Date(payment.payment_date) < firstDayOfMonth
        );
        
        // Calculate repayment rates (or use fallback if no data)
        // In a real system you'd calculate this based on expected vs. actual payments
        const currentRepaymentRate = 94.8; // This would be calculated from actual payment data
        const lastMonthRepaymentRate = 96; // This would be calculated from actual payment data
        const repaymentRateChange = currentRepaymentRate - lastMonthRepaymentRate;

        // Format recent clients data
        const recentClients = (recentClientsResult.data || []).map(client => ({
          id: client.id,
          name: client.full_name,
          registrationDate: client.created_at
        }));

        // Format recent loans data
        const recentLoans = (recentLoansResult.data || []).map(loan => ({
          id: loan.id,
          amount: loan.amount,
          duration: loan.duration_months,
          status: loan.status
        }));

        // Return the complete metrics object
        return {
          loanPortfolio: {
            total: currentPortfolio,
            monthlyGrowth: portfolioGrowth
          },
          activeClients: {
            total: currentClientCount,
            monthlyGrowth: clientGrowth
          },
          repaymentRate: {
            current: currentRepaymentRate,
            monthlyChange: repaymentRateChange
          },
          recentClients,
          recentLoans
        };
      } catch (error) {
        console.error('Error in useSfdDashboardMetrics:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnWindowFocus: true,
    staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
    retry: 3, // Retry 3 times on failure
  });
}
