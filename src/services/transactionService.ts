
import { supabase } from '@/integrations/supabase/client';
import { Transaction, DatabaseTransactionRecord } from '@/types/transactions';
import { convertDatabaseRecordsToTransactions } from '@/utils/transactionUtils';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_disbursement' | 'other';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'flagged';

export interface CreateTransactionOptions {
  userId: string;
  sfdId?: string;
  name: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  referenceId?: string;
}

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

class TransactionService {
  async createTransaction(options: CreateTransactionOptions): Promise<Transaction | null> {
    try {
      const {
        userId,
        sfdId,
        name,
        amount,
        type,
        status = 'success',
        description,
        paymentMethod,
        metadata,
        referenceId
      } = options;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          name: name,
          amount: amount,
          type: type,
          status: status,
          description: description,
          payment_method: paymentMethod,
          metadata: metadata,
          reference_id: referenceId,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return null;
      }

      return this.formatTransaction(data);
    } catch (error) {
      console.error('Transaction creation failed:', error);
      return null;
    }
  }

  async getUserTransactions(userId: string, sfdId?: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }

      if (filters) {
        // Apply any filters
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.startDate) {
          query = query.gte('date', filters.startDate);
        }

        if (filters.endDate) {
          query = query.lte('date', filters.endDate);
        }

        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }

        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }

        if (filters.searchTerm) {
          query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
        }
      }

      // Order by date (newest first)
      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data.map(record => this.formatTransaction(record));
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  async getSfdTransactions(sfdId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('sfd_id', sfdId);

      // Apply filters similarly to getUserTransactions
      if (filters) {
        // ... Apply filters as in getUserTransactions
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching SFD transactions:', error);
        return [];
      }

      return data.map(record => this.formatTransaction(record));
    } catch (error) {
      console.error('Failed to fetch SFD transactions:', error);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error('Error fetching transaction by ID:', error);
        return null;
      }

      return this.formatTransaction(data);
    } catch (error) {
      console.error('Failed to fetch transaction by ID:', error);
      return null;
    }
  }

  async updateTransactionStatus(transactionId: string, status: TransactionStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) {
        console.error('Error updating transaction status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      return false;
    }
  }

  async flagTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'flagged',
          metadata: supabase.rpc('jsonb_set', { 
            jsonb: supabase.rpc('coalesce', { val: 'metadata', default: '{}' }), 
            path: '{flag_reason}', 
            value: reason 
          })
        })
        .eq('id', transactionId);

      if (error) {
        console.error('Error flagging transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to flag transaction:', error);
      return false;
    }
  }

  private formatTransaction(record: any): Transaction {
    return {
      id: record.id,
      user_id: record.user_id,
      sfd_id: record.sfd_id,
      type: record.type as TransactionType,
      amount: record.amount,
      status: (record.status || 'success') as TransactionStatus,
      description: record.description,
      metadata: record.metadata,
      payment_method: record.payment_method,
      reference_id: record.reference_id,
      created_at: record.created_at || record.date,
      updated_at: record.updated_at,
      date: record.date,
      name: record.name,
      avatar_url: record.avatar_url
    };
  }

  async generateTransactionStatistics(userId: string, sfdId?: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalVolume: number;
    transactionCount: number;
    averageAmount: number;
    depositVolume: number;
    withdrawalVolume: number;
  }> {
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

      const transactions = await this.getUserTransactions(userId, sfdId, {
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

export const transactionService = new TransactionService();
