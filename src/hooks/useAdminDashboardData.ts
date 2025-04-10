
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type DashboardStats = {
  activeSfds: number;
  newSfdsThisMonth: number;
  admins: number;
  newAdminsThisMonth: number;
  totalUsers: number;
  newUsersThisMonth: number;
};

export type SubsidiesData = {
  totalAmount: number;
  allocatedAmount: number;
  usedAmount: number;
  availableAmount: number;
  usagePercentage: number;
  newThisMonth: string;
};

export type PendingRequest = {
  id: string;
  sfd_name: string;
  amount: number;
  purpose: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
};

export type RecentApproval = {
  id: string;
  sfd_name: string;
  amount: number;
  approved_at: string;
};

export type AdminDashboardData = {
  stats: DashboardStats;
  subsidies: SubsidiesData;
  pendingRequests: PendingRequest[];
  recentApprovals: RecentApproval[];
};

export function useAdminDashboardData(timeframe: 'week' | 'month' | 'year' = 'month') {
  const { toast } = useToast();

  const fetchDashboardData = async (): Promise<AdminDashboardData> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard-data', {
        body: JSON.stringify({ timeframe }),
      });

      if (error) throw error;
      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to fetch dashboard data');
      }

      return data.data as AdminDashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données du tableau de bord",
        variant: "destructive",
      });
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminDashboardData', timeframe],
    queryFn: fetchDashboardData,
  });

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch,
  };
}
