
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { 
  CreateTransactionOptions, 
  TransactionFilters, 
  TransactionType, 
  TransactionStatus 
} from './types';
import { buildTransactionQuery } from './transactionQueryBuilder';
import { formatTransaction } from './transactionFormatter';

class TransactionService {
  /**
   * Create a new transaction
   */
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

      return formatTransaction(data);
    } catch (error) {
      console.error('Transaction creation failed:', error);
      return null;
    }
  }

  /**
   * Get transactions for a specific user
   */
  async getUserTransactions(userId: string, sfdId?: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const query = buildTransactionQuery(userId, sfdId, filters);
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      // Map the database records to our Transaction type
      return data.map(record => formatTransaction(record));
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific SFD
   */
  async getSfdTransactions(sfdId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const query = buildTransactionQuery(undefined, sfdId, filters);
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching SFD transactions:', error);
        return [];
      }

      return data.map(record => formatTransaction(record));
    } catch (error) {
      console.error('Failed to fetch SFD transactions:', error);
      return [];
    }
  }

  /**
   * Get a transaction by ID
   */
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

      return formatTransaction(data);
    } catch (error) {
      console.error('Failed to fetch transaction by ID:', error);
      return null;
    }
  }

  /**
   * Flag a transaction for review
   * Note: Currently just logs the action since status field isn't in the schema
   */
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
}

export const transactionService = new TransactionService();
