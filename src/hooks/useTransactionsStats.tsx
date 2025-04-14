
import { useState, useCallback } from 'react';
import { Transaction } from '@/types/transactions';
import { TransactionStats } from '@/types/transactions';
import { UseTransactionsStatsProps } from '@/types/realtimeTransactions';

export function useTransactionsStats({ transactions }: UseTransactionsStatsProps) {
  const [stats, setStats] = useState<TransactionStats>({
    totalAmount: 0,
    incomeAmount: 0,
    expenseAmount: 0,
    count: 0
  });

  const calculateStats = useCallback(() => {
    const count = transactions.length;
    
    let totalAmount = 0;
    let incomeAmount = 0;
    let expenseAmount = 0;
    
    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      
      if (tx.type === 'deposit' || tx.type === 'loan_disbursement') {
        incomeAmount += amount;
        totalAmount += amount;
      } else {
        expenseAmount += Math.abs(amount);
        totalAmount -= Math.abs(amount);
      }
    });
    
    setStats({
      totalAmount,
      incomeAmount,
      expenseAmount,
      count
    });
    
  }, [transactions]);

  return {
    stats,
    calculateStats
  };
}
