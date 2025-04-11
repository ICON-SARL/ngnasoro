
import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  totalSubsidies: number;
  approvedSubsidies: number;
  pendingSubsidies: number;
  totalClients: number;
}

export interface SubsidiesData {
  total: number;
  approved: number;
  pending: number;
  approvedAmount: number;
  pendingAmount: number;
}

export interface RecentApproval {
  id: string;
  sfd_name: string;
  amount: number;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  region: string;
}

export const useAdminDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSfds: 0,
    activeSfds: 0,
    totalSubsidies: 0,
    approvedSubsidies: 0,
    pendingSubsidies: 0,
    totalClients: 0
  });
  
  const [subsidiesData, setSubsidiesData] = useState<SubsidiesData>({
    total: 0,
    approved: 0,
    pending: 0,
    approvedAmount: 0,
    pendingAmount: 0
  });
  
  const [recentApprovals, setRecentApprovals] = useState<RecentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This would be real API calls in production
        // For now, we'll use mock data
        setTimeout(() => {
          // Mock dashboard stats
          setStats({
            totalSfds: 124,
            activeSfds: 115,
            totalSubsidies: 87,
            approvedSubsidies: 65,
            pendingSubsidies: 22,
            totalClients: 1840
          });
          
          // Mock subsidies data
          setSubsidiesData({
            total: 87,
            approved: 65,
            pending: 22,
            approvedAmount: 245000000,
            pendingAmount: 78000000
          });
          
          // Mock recent approvals
          setRecentApprovals([
            {
              id: '1',
              sfd_name: 'Kafo Jiginew',
              amount: 25000000,
              date: '2023-04-15',
              status: 'approved',
              region: 'Sikasso'
            },
            {
              id: '2',
              sfd_name: 'Nyèsigiso',
              amount: 18000000,
              date: '2023-04-12',
              status: 'approved',
              region: 'Ségou'
            },
            {
              id: '3',
              sfd_name: 'Soro Yiriwaso',
              amount: 22000000,
              date: '2023-04-10',
              status: 'approved',
              region: 'Mopti'
            },
            {
              id: '4',
              sfd_name: 'RMCR',
              amount: 15000000,
              date: '2023-04-08',
              status: 'pending',
              region: 'Kayes'
            },
            {
              id: '5',
              sfd_name: 'CAECE Jigiseme',
              amount: 12000000,
              date: '2023-04-05',
              status: 'approved',
              region: 'Koulikoro'
            }
          ]);
          
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
};
