
import { Transaction } from '@/types/transactions';
import { transactionService } from './transactionService';
import { TransactionStatistics } from './types';

class TransactionStatisticsService {
  /**
   * Generate statistics for a user's transactions over a given period
   */
  async generateTransactionStatistics(
    userId: string, 
    sfdId?: string, 
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<TransactionStatistics> {
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

      const transactions = await transactionService.getUserTransactions(userId, sfdId, {
        startDate: startDate.toISOString()
      });

      if (transactions.length === 0) {
        return {
          totalVolume: 0,
          transactionCount: 0,
          averageAmount: 0,
          depositVolume: 0,
          withdrawalVolume: 0
        };
      }

      const depositTransactions = transactions.filter(tx => 
        tx.type === 'deposit' || 
        (tx.type === 'transfer' && tx.amount > 0)
      );
      
      const withdrawalTransactions = transactions.filter(tx => 
        tx.type === 'withdrawal' || 
        (tx.type === 'payment') || 
        (tx.type === 'transfer' && tx.amount < 0)
      );

      const totalVolume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const depositVolume = depositTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const withdrawalVolume = withdrawalTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      return {
        totalVolume,
        transactionCount: transactions.length,
        averageAmount: totalVolume / transactions.length,
        depositVolume,
        withdrawalVolume
      };
    } catch (error) {
      console.error('Failed to generate transaction statistics:', error);
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
