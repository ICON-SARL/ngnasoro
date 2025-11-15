import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MerefNotifications {
  pendingSfds: number;
  pendingCredits: number;
  pendingSubsidies: number;
  overdueLoans: number;
}

export const useMerefNotifications = () => {
  return useQuery<MerefNotifications>({
    queryKey: ['meref-notifications'],
    queryFn: async () => {
      // Count pending SFDs
      const { count: pendingSfds } = await supabase
        .from('sfds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Count pending MEREF loan requests
      const { count: pendingCredits } = await supabase
        .from('meref_loan_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Count pending subsidy requests
      const { count: pendingSubsidies } = await supabase
        .from('subsidy_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Count overdue loans (>30 days past next_payment_date)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: overdueLoans } = await supabase
        .from('sfd_loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('next_payment_date', thirtyDaysAgo.toISOString());

      return {
        pendingSfds: pendingSfds || 0,
        pendingCredits: pendingCredits || 0,
        pendingSubsidies: pendingSubsidies || 0,
        overdueLoans: overdueLoans || 0
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};
