
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubsidyStatistics {
  monthly: {
    month: string;
    requested: number;
    approved: number;
    amount: number;
  }[];
  totalApproved: number;
  totalRequested: number;
  totalAmount: number;
  approvalRate: number;
}

export const useSubsidyStatistics = () => {
  const { activeSfdId, user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['subsidy-statistics', activeSfdId],
    queryFn: async (): Promise<SubsidyStatistics> => {
      try {
        // Get the current date
        const currentDate = new Date();
        const monthlyStats = [];
        
        // Generate the last 6 months
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
          
          const monthName = month.toLocaleDateString('fr-FR', { month: 'short' });
          const startDate = month.toISOString();
          const endDate = monthEnd.toISOString();
          
          // Count all subsidy requests in this month
          const { count: requestedCount, error: requestedError } = await supabase
            .from('subsidy_requests')
            .select('id', { count: 'exact' })
            .eq('sfd_id', activeSfdId)
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (requestedError) throw requestedError;
          
          // Count approved subsidy requests in this month
          const { count: approvedCount, error: approvedError } = await supabase
            .from('subsidy_requests')
            .select('id', { count: 'exact' })
            .eq('sfd_id', activeSfdId)
            .eq('status', 'approved')
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (approvedError) throw approvedError;
          
          // Sum approved subsidy amounts in this month
          const { data: amountData, error: amountError } = await supabase
            .from('subsidy_requests')
            .select('amount')
            .eq('sfd_id', activeSfdId)
            .eq('status', 'approved')
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (amountError) throw amountError;
          
          const monthAmount = amountData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
          
          monthlyStats.push({
            month: monthName,
            requested: requestedCount || 0,
            approved: approvedCount || 0,
            amount: monthAmount
          });
        }
        
        // Get totals for all time
        const { count: totalRequestedCount, error: totalRequestedError } = await supabase
          .from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId);
          
        if (totalRequestedError) throw totalRequestedError;
        
        const { count: totalApprovedCount, error: totalApprovedError } = await supabase
          .from('subsidy_requests')
          .select('id', { count: 'exact' })
          .eq('sfd_id', activeSfdId)
          .eq('status', 'approved');
          
        if (totalApprovedError) throw totalApprovedError;
        
        const { data: totalAmountData, error: totalAmountError } = await supabase
          .from('subsidy_requests')
          .select('amount')
          .eq('sfd_id', activeSfdId)
          .eq('status', 'approved');
          
        if (totalAmountError) throw totalAmountError;
        
        const totalAmount = totalAmountData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        const approvalRate = totalRequestedCount ? Math.round((totalApprovedCount / totalRequestedCount) * 100) : 0;
        
        return {
          monthly: monthlyStats,
          totalRequested: totalRequestedCount || 0,
          totalApproved: totalApprovedCount || 0,
          totalAmount,
          approvalRate
        };
      } catch (error) {
        console.error('Error fetching subsidy statistics:', error);
        throw error;
      }
    },
    enabled: !!activeSfdId && !!user
  });
  
  return {
    statistics: data || {
      monthly: [],
      totalApproved: 0,
      totalRequested: 0,
      totalAmount: 0,
      approvalRate: 0
    },
    isLoading,
    error
  };
};
