
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LoanStats {
  activeLoans: number;
  totalActiveAmount: number;
  repaymentRate: number;
  repaymentChange: number;
  lateLoans: number;
  lateAmount: number;
}

export function useLoanStats() {
  const { activeSfdId } = useAuth();
  const [stats, setStats] = useState<LoanStats>({
    activeLoans: 0,
    totalActiveAmount: 0,
    repaymentRate: 0,
    repaymentChange: 0,
    lateLoans: 0,
    lateAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSfdId) return;

    const fetchStats = async () => {
      try {
        // Get active loans
        const { data: activeLoans, error: activeError } = await supabase
          .from('sfd_loans')
          .select('amount, monthly_payment, next_payment_date')
          .eq('sfd_id', activeSfdId)
          .eq('status', 'active');

        if (activeError) throw activeError;

        // Calculate late loans
        const now = new Date();
        const lateLoans = activeLoans?.filter(loan => {
          const nextPayment = loan.next_payment_date ? new Date(loan.next_payment_date) : null;
          return nextPayment && nextPayment < now;
        }) || [];

        // Get repayment rate from sfd_stats
        const { data: sfdStats, error: statsError } = await supabase
          .from('sfd_stats')
          .select('repayment_rate')
          .eq('sfd_id', activeSfdId)
          .single();

        if (statsError) throw statsError;

        setStats({
          activeLoans: activeLoans?.length || 0,
          totalActiveAmount: activeLoans?.reduce((sum, loan) => sum + loan.amount, 0) || 0,
          repaymentRate: sfdStats?.repayment_rate || 0,
          repaymentChange: 2, // Hardcoded for now, could be calculated from historical data
          lateLoans: lateLoans.length,
          lateAmount: lateLoans.reduce((sum, loan) => sum + loan.amount, 0)
        });
      } catch (error) {
        console.error('Error fetching loan stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeSfdId]);

  return { stats, loading };
}
