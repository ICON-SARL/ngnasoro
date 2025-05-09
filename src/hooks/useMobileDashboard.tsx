
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { dashboardApi, DashboardData } from '@/utils/dashboardApi';

export function useMobileDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchDashboardData = useCallback(async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    if (!user?.id) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await dashboardApi.getDashboardData(user.id, period);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error in useMobileDashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const refreshDashboardData = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const success = await dashboardApi.refreshDashboardData(user.id);
      if (success) {
        await fetchDashboardData();
        toast({
          title: 'Dashboard Updated',
          description: 'Your financial data has been refreshed',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      return false;
    }
  }, [user, fetchDashboardData, toast]);
  
  // Load dashboard data on component mount
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);
  
  return {
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
    refreshDashboardData
  };
}
