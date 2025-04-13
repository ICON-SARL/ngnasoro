
import React, { useEffect } from 'react';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { Account } from '@/types/transactions';
import { useToast } from '@/hooks/use-toast';
import { MainDashboard } from './dashboard';

interface MobileDashboardProps {
  onTitleChange?: (title: string) => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onTitleChange }) => {
  const { dashboardData, isLoading: dashboardLoading, refreshDashboardData } = useMobileDashboard();
  const { toast } = useToast();
  
  const mockAccount: Account = {
    id: '1',
    balance: dashboardData?.account?.balance || 0,
    currency: 'FCFA',
    type: 'savings',
    owner_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active'
  };
  
  useEffect(() => {
    // Set the page title when component mounts
    if (onTitleChange) {
      onTitleChange('Tableau de bord');
    }
    
    // Refresh dashboard data
    if (refreshDashboardData) {
      refreshDashboardData().catch(error => {
        console.error("Error refreshing dashboard data:", error);
      });
    }
  }, [onTitleChange, refreshDashboardData]);
  
  const handleToggleMenu = () => {
    // Menu toggle functionality would go here
    console.log("Menu toggled");
  };
  
  return (
    <MainDashboard
      onAction={(action, data) => console.log(action, data)}
      account={mockAccount}
      transactions={dashboardData?.transactions || []}
      transactionsLoading={dashboardLoading}
      toggleMenu={handleToggleMenu}
    />
  );
};

export default MobileDashboard;
