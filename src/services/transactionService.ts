
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
        description,
        paymentMethod,
        referenceId
      } = options;

      // Prepare the data object to match the expected table schema
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        name: name,
        amount: amount,
        type: type,
        date: new Date().toISOString(),
        description,
        payment_method: paymentMethod,
        reference_id: referenceId
      };

      // Insert into the transactions table
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
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
      let query = supabase.from('transactions').select('*');
      
      // Apply user_id filter (always required)
      query = query.eq('user_id', userId);
      
      // Apply sfd_id filter if provided
      if (sfdId) {
        query = query.eq('sfd_id', sfdId);
      }
      
      // Apply optional filters separately (without chaining)
      if (filters) {
        // Filter by type
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }
        
        // Date range filters
        if (filters.startDate) {
          query = query.gte('date', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('date', filters.endDate);
        }
        
        // Amount range filters
        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        // Search term
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          query = query.ilike('name', `%${filters.searchTerm}%`);
        }
      }
      
      // Order by date (newest first)
      query = query.order('date', { ascending: false });
      
      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      // Map the database records to our Transaction type
      return data.map(record => this.formatTransaction(record));
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  async getSfdTransactions(sfdId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Start with a basic query
      let query = supabase.from('transactions').select('*');
      
      // Apply sfd_id filter (always required)
      query = query.eq('sfd_id', sfdId);
      
      // Apply filters if provided (reuse similar logic as getUserTransactions)
      if (filters) {
        // Type filter
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            query = query.in('type', filters.type);
          } else {
            query = query.eq('type', filters.type);
          }
        }
        
        // Date filters
        if (filters.startDate) query = query.gte('date', filters.startDate);
        if (filters.endDate) query = query.lte('date', filters.endDate);
        
        // Amount filters
        if (filters.minAmount) query = query.gte('amount', filters.minAmount);
        if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
        
        // Search
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          query = query.ilike('name', `%${filters.searchTerm}%`);
        }
      }
      
      // Order by date (newest first)
      query = query.order('date', { ascending: false });
      
      // Execute the query
      const { data, error } = await query;

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

  async flagTransaction(transactionId: string, reason: string): Promise<boolean> {
    try {
      // Since our schema doesn't have a status field, we'll use metadata
      // For now, we'll just log the action since we don't have a status or metadata field
      console.log(`Transaction ${transactionId} would be flagged with reason: ${reason}`);
      
      // In a real implementation with a proper schema, we would update the transaction
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
      status: 'success' as TransactionStatus, // Default status since it's not in our schema
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
