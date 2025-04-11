
import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  pendingSfds: number;
  inactiveSfds: number;
  newSfdsThisMonth: number;
  admins: number;
  sfdAdmins: number;
  newAdminsThisMonth: number;
  totalUsers: number;
  newUsersThisMonth: number;
  pendingSubsidies: number;
  totalClients: number;
  // Add other required properties
}

export interface SubsidiesData {
  totalAmount: number;
  availableAmount: number;
  usagePercentage: number;
  approvedAmount: number;
  pendingAmount: number;
  total?: number;
  approved?: number;
  pending?: number;
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
    pendingSfds: 0,
    inactiveSfds: 0,
    newSfdsThisMonth: 0,
    admins: 0,
    sfdAdmins: 0,
    newAdminsThisMonth: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    pendingSubsidies: 0,
    totalClients: 0
  });
  
  const [subsidiesData, setSubsidiesData] = useState<SubsidiesData>({
    totalAmount: 0,
    availableAmount: 0,
    usagePercentage: 0,
    approvedAmount: 0,
    pendingAmount: 0,
    total: 0,
    approved: 0,
    pending: 0
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
            pendingSfds: 5,
            inactiveSfds: 4,
            newSfdsThisMonth: 8,
            admins: 12,
            sfdAdmins: 35,
            newAdminsThisMonth: 3,
            totalUsers: 1840,
            newUsersThisMonth: 120,
            pendingSubsidies: 22,
            totalClients: 1840
          });
          
          // Mock subsidies data
          setSubsidiesData({
            totalAmount: 323000000,
            availableAmount: 78000000,
            usagePercentage: 76,
            approvedAmount: 245000000,
            pendingAmount: 78000000,
            total: 87,
            approved: 65,
            pending: 22
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
              amount: 18500000,
              date: '2023-04-10',
              status: 'approved',
              region: 'Bamako'
            },
            {
              id: '3',
              sfd_name: 'Soro Yiriwaso',
              amount: 15000000,
              date: '2023-04-05',
              status: 'pending',
              region: 'Ségou'
            }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
