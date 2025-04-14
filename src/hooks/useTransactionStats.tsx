
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionStatisticsService } from '@/services/transactions/transactionStatisticsService';

interface TransactionStats {
  totalCount: number;
  totalVolume: number;
  averageAmount: number;
  depositVolume: number;
  withdrawalVolume: number;
  flaggedCount: number;
  compareYesterday: {
    countChange: number;
    volumeChange: number;
    averageChange: number;
  };
}

export function useTransactionStats(period: 'day' | 'week' | 'month' = 'day') {
  const { user, activeSfdId } = useAuth();
  const [stats, setStats] = useState<TransactionStats>({
    totalCount: 0,
    totalVolume: 0,
    averageAmount: 0,
    depositVolume: 0,
    withdrawalVolume: 0,
    flaggedCount: 0,
    compareYesterday: {
      countChange: 0,
      volumeChange: 0,
      averageChange: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.id || !activeSfdId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const statsData = await transactionStatisticsService.generateTransactionStatistics(
        user.id,
        activeSfdId,
        period
      );
      
      // Calculate percentage changes (in a real app this would come from a comparison API)
      // For now we'll use fixed sample values
      const countChange = period === 'day' ? 12 : period === 'week' ? 5 : 2;
      const volumeChange = period === 'day' ? 5 : period === 'week' ? 3 : 1;
      const averageChange = period === 'day' ? -2 : period === 'week' ? 1 : 0;
      
      setStats({
        totalCount: Math.round(statsData.transactionCount),
        totalVolume: statsData.totalVolume,
        averageAmount: statsData.averageAmount,
        depositVolume: statsData.depositVolume,
        withdrawalVolume: statsData.withdrawalVolume,
        flaggedCount: 7, // This would come from a real flagging system
        compareYesterday: {
          countChange,
          volumeChange,
          averageChange
        }
      });
    } catch (err: any) {
      console.error("Error fetching transaction stats:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId, period]);

  // Fetch stats on component mount and when dependencies change
  useEffect(() => {
    fetchStats();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 300000); // refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats
  };
}
