import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CreateTransactionOptions, TransactionFilters } from './types';
import { AuditLogSeverity, AuditLogCategory, AuditLogEntry } from '@/utils/audit';

export const transactionService = {
  // Get user transactions
  async getUserTransactions(userId: string, sfdId: string | null, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Cast to any to avoid type recursion issues with the query builder
      let query = supabase
        .from('transactions')
        .select('*') as any;
      
      query = query.eq('user_id', userId);
      
      // Ne pas filtrer par SFD si c'est "default-sfd" ou null/undefined
      if (sfdId && sfdId !== 'default-sfd' && sfdId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        query = query.eq('sfd_id', sfdId);
      }

      if (filters) {
        if (filters.type) {
          if (Array.isArray(filters.type)) {
            // Handle array of transaction types using in() operator
            // Make a basic copy and cast to string[] to avoid excessive type instantiation
            const typeArray = [...filters.type] as string[];
            query = query.in('type', typeArray);
          } else {
            // Handle single transaction type
            query = query.eq('type', filters.type);
          }
        }
        
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          query = query.ilike('name', `%${filters.searchTerm}%`);
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.paymentMethod) {
          query = query.eq('payment_method', filters.paymentMethod);
        }
        
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  // Create a new transaction using the atomic transaction processor
  async createTransaction(options: CreateTransactionOptions): Promise<Transaction> {
    try {
      console.log('Creating transaction with options:', options);
      
      // Call the atomic transaction processor edge function
      const { data, error } = await supabase.functions.invoke('process-atomic-transaction', {
        body: {
          userId: options.userId,
          sfdId: options.sfdId,
          type: options.type,
          amount: options.amount,
          description: options.description,
          referenceId: options.referenceId,
          metaData: {
            paymentMethod: options.paymentMethod,
            category: options.category
          }
        }
      });
      
      if (error) {
        console.error('Error in atomic transaction processing:', error);
        throw new Error(error.message || 'Failed to process transaction');
      }
      
      if (!data.success) {
        throw new Error(data.errorMessage || 'Transaction failed');
      }
      
      // Fetch the created transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', data.transactionId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching created transaction:', fetchError);
        throw new Error('Transaction was processed but could not be retrieved');
      }
      
      return transaction as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction: ' + (error.message || 'Unknown error'));
    }
  },

  // Get PDF receipt for a transaction
  async getTransactionReceipt(transactionId: string): Promise<{ url: string, fileName: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { id: transactionId }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.errorMessage || 'Failed to generate receipt');
      
      return {
        url: data.receiptUrl || `/api/receipts/${data.fileName}`,
        fileName: data.fileName
      };
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new Error('Failed to generate receipt');
    }
  },

  // Récupérer le solde du compte
  async getAccountBalance(userId: string, sfdId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      return data.balance || 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  },
  
  // Verify transaction security
  async verifyTransactionSecurity(userId: string, amount: number, transactionType: string): Promise<boolean> {
    try {
      // Implement transaction security checks
      // 1. Check if user has recent suspicious activities
      const { data: recentSuspicious } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('category', 'SECURITY')
        .eq('severity', 'warning')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
        
      if (recentSuspicious && recentSuspicious.length > 3) {
        console.warn('User has suspicious activities within 24 hours');
        return false;
      }
      
      // 2. Check transaction limits
      if (transactionType === 'withdrawal' && amount > 5000000) {
        console.warn('Withdrawal amount exceeds security limit');
        return false;
      }
      
      // Add more security checks as needed
      
      return true;
    } catch (error) {
      console.error('Error verifying transaction security:', error);
      return false;
    }
  },
  
  // Process mobile money transaction
  async processMobileMoneyTransaction(phone: string, amount: number, description: string, type: string): Promise<boolean> {
    try {
      // Call mobile money integration
      const { data, error } = await supabase.functions.invoke('mobile-money-sync', {
        body: {
          phone_number: phone,
          amount: amount,
          description: description,
          transaction_type: type,
          reference: `mm-${Date.now()}`,
          initiated_by: 'app'
        }
      });
      
      if (error) throw error;
      return data.success === true;
    } catch (error) {
      console.error('Error processing mobile money transaction:', error);
      return false;
    }
  }
};
