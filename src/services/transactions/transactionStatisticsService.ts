
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { TransactionFilters, TransactionStatus } from './types';
import { transactionService } from './transactionService';

interface TransactionStats {
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  depositVolume: number;
  withdrawalVolume: number;
}

class TransactionStatisticsService {
  async generateTransactionStatistics(
    userId: string, 
    sfdId?: string, 
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<TransactionStats> {
    try {
      let startDate = new Date();
      
      // Calculate start date based on period
      if (period === 'day') {
        startDate.setDate(startDate.getDate() - 1);
      } else if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const filter: TransactionFilters = {
        startDate: startDate.toISOString()
      };

      const transactions = await transactionService.getUserTransactions(userId, sfdId, filter);

      // Default values if no transactions are found
      if (!transactions.length) {
        return {
          totalVolume: 0,
          transactionCount: 0,
          averageAmount: 0,
          depositVolume: 0,
          withdrawalVolume: 0
        };
      }

      // Calculate statistics
      const totalVolume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const transactionCount = transactions.length;
      const averageAmount = totalVolume / transactionCount;
      
      // Calculate deposit and withdrawal volumes
      const depositTransactions = transactions.filter(tx => 
        tx.type === 'deposit' || 
        (tx.type === 'transfer' && tx.amount > 0)
      );
      
      const withdrawalTransactions = transactions.filter(tx => 
        tx.type === 'withdrawal' || 
        (tx.type === 'payment') || 
        (tx.type === 'transfer' && tx.amount < 0)
      );
      
      const depositVolume = depositTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const withdrawalVolume = withdrawalTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      return {
        totalVolume,
        transactionCount,
        averageAmount,
        depositVolume,
        withdrawalVolume
      };
    } catch (error) {
      console.error('Error generating transaction statistics:', error);
      return {
        totalVolume: 0,
        transactionCount: 0,
        averageAmount: 0,
        depositVolume: 0,
        withdrawalVolume: 0
      };
    }
  }
}

export const transactionStatisticsService = new TransactionStatisticsService();
