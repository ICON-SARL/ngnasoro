import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { CreateTransactionOptions, TransactionFilters } from './types';
import { AuditLogSeverity, AuditLogCategory, AuditLogEntry } from '@/utils/audit';

export const transactionService = {
  // Récupérer les transactions d'un utilisateur
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

  // Créer une nouvelle transaction
  async createTransaction(options: CreateTransactionOptions): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: options.userId,
          sfd_id: options.sfdId,
          name: options.name,
          amount: options.amount,
          type: options.type,
          status: options.status || 'success',
          description: options.description,
          payment_method: options.paymentMethod,
          reference_id: options.referenceId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
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
  }
};
