
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  return useQuery({
    queryKey: ['sfd-dashboard-metrics', activeSfdId],
    queryFn: async (): Promise<SfdMetrics> => {
      if (!activeSfdId) throw new Error('No active SFD selected');
      
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      
      const [
        { data: currentLoans },
        { data: lastMonthLoans },
        { data: currentClients },
        { data: lastMonthClients },
        { data: recentClients },
        { data: recentLoans },
        { data: loanPayments }
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
          .select('amount, payment_date')
          .eq('status', 'completed')
          .gte('payment_date', firstDayOfLastMonth.toISOString())
      ]);

      // Calculate portfolio growth
      const currentPortfolio = currentLoans?.reduce((sum, loan) => sum + loan.amount, 0) || 0;
      const lastMonthPortfolio = lastMonthLoans?.reduce((sum, loan) => sum + loan.amount, 0) || 0;
      const portfolioGrowth = lastMonthPortfolio ? 
        ((currentPortfolio - lastMonthPortfolio) / lastMonthPortfolio) * 100 : 0;

      // Calculate client growth
      const currentClientCount = currentClients?.length || 0;
      const lastMonthClientCount = lastMonthClients?.length || 0;
      const clientGrowth = lastMonthClientCount ? 
        ((currentClientCount - lastMonthClientCount) / lastMonthClientCount) * 100 : 0;

      // Calculate repayment rate changes
      const currentMonthPayments = loanPayments?.filter(
        payment => new Date(payment.payment_date) >= firstDayOfMonth
      );
      const lastMonthPayments = loanPayments?.filter(
        payment => new Date(payment.payment_date) >= firstDayOfLastMonth 
          && new Date(payment.payment_date) < firstDayOfMonth
      );
      
      const currentRepaymentRate = 94.8; // This would be calculated from actual payment data
      const lastMonthRepaymentRate = 96; // This would be calculated from actual payment data
      const repaymentRateChange = currentRepaymentRate - lastMonthRepaymentRate;

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
        recentClients: recentClients?.map(client => ({
          id: client.id,
          name: client.full_name,
          registrationDate: client.created_at
        })) || [],
        recentLoans: recentLoans?.map(loan => ({
          id: loan.id,
          amount: loan.amount,
          duration: loan.duration_months,
          status: loan.status
        })) || []
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
