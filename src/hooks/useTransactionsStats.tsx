
import { useState, useCallback } from 'react';
import { TransactionStats } from '@/types/transactions';
import { UseTransactionsStatsProps } from '@/types/realtimeTransactions';

export function useTransactionsStats({ transactions }: UseTransactionsStatsProps) {
  const [stats, setStats] = useState<TransactionStats>({
    totalCount: 0,
    totalVolume: 0,
    averageAmount: 0,
    successRate: 0,
    pendingCount: 0,
    flaggedCount: 0
  });
  
  const calculateStats = useCallback(() => {
    const totalCount = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount = totalCount > 0 ? totalVolume / totalCount : 0;
    const successCount = transactions.filter(tx => tx.status === 'success').length;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
    const flaggedCount = transactions.filter(tx => tx.status === 'flagged').length;
    
    setStats({
      totalCount,
      totalVolume,
      averageAmount,
      successRate,
      pendingCount,
      flaggedCount
    });
  }, [transactions]);

  return {
    stats,
    calculateStats
  };
}
