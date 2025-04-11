
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  activeSfds: number;
  suspendedSfds: number;
  totalSfds: number;
  newSfdsThisMonth: number;
  admins: number;
  newAdminsThisMonth: number;
  totalUsers: number;
  newUsersThisMonth: number;
}

export interface SubsidiesData {
  totalAmount: number;
  availableAmount: number;
  usagePercentage: number;
}

export interface RecentApproval {
  id: string;
  sfd_name: string;
  amount: number;
  date: string;
}

export function useAdminDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeSfds: 0,
    suspendedSfds: 0,
    totalSfds: 0,
    newSfdsThisMonth: 0,
    admins: 0,
    newAdminsThisMonth: 0,
    totalUsers: 0,
    newUsersThisMonth: 0
  });
  
  const [subsidiesData, setSubsidiesData] = useState<SubsidiesData>({
    totalAmount: 0,
    availableAmount: 0,
    usagePercentage: 0
  });
  
  const [recentApprovals, setRecentApprovals] = useState<RecentApproval[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch data from the API
        // For now, using mock data
        
        // Fetch SFD stats
        const { data: sfdsData } = await supabase
          .from('sfds')
          .select('id, status, created_at');
          
        const activeSfds = sfdsData?.filter(sfd => sfd.status === 'active').length || 0;
        const suspendedSfds = sfdsData?.filter(sfd => sfd.status === 'suspended').length || 0;
        const totalSfds = sfdsData?.length || 0;
        
        // Fetch admin stats
        const { count: adminsCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin');
        
        // Fetch user stats
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        setStats({
          activeSfds,
          suspendedSfds,
          totalSfds,
          newSfdsThisMonth: 2,
          admins: adminsCount || 0,
          newAdminsThisMonth: 1,
          totalUsers: usersCount || 0,
          newUsersThisMonth: 15
        });
        
        // Set mock subsidies data for now
        setSubsidiesData({
          totalAmount: 1000000000,
          availableAmount: 650000000,
          usagePercentage: 35
        });
        
        // Set mock recent approvals
        setRecentApprovals([
          { id: '1', sfd_name: 'Micro Finance Alpha', amount: 5000000, date: '2025-03-15' },
          { id: '2', sfd_name: 'Caisse Populaire Beta', amount: 3500000, date: '2025-03-10' },
          { id: '3', sfd_name: 'Crédit Delta', amount: 2000000, date: '2025-03-05' }
        ]);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    subsidiesData,
    recentApprovals,
    isLoading
  };
}
