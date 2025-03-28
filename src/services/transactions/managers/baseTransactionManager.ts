
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { logAuditEvent } from '@/services/transactionService';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { TransactionParams } from '../interfaces/transactionInterfaces';

/**
 * Base class for transaction management
 */
export class BaseTransactionManager {
  protected userId: string;
  protected sfdId: string;

  constructor(userId: string, sfdId: string) {
    this.userId = userId;
    this.sfdId = sfdId;
  }

  /**
   * Creates a new transaction in the database
   */
  async createTransaction(params: TransactionParams): Promise<Transaction | null> {
    try {
      const { amount, type, description, paymentMethod, referenceId, name } = params;
      
      // Prepare data for the database
      const transactionData = {
        user_id: this.userId,
        sfd_id: this.sfdId,
        amount: amount,
        type: type,
        description: description || `Transaction ${type}`,
        payment_method: paymentMethod || 'sfd_account',
        reference_id: referenceId || `tx-${Date.now()}`,
        name: name || `Transaction ${type}`,
        date: new Date().toISOString(),
        status: 'success'
      };

      // Insert the transaction into the database
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        
        // Log the error for audit
        await logAuditEvent({
          action: "transaction_creation",
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          status: 'failure',
          user_id: this.userId,
          error_message: error.message,
          details: { type, amount, sfd_id: this.sfdId }
        });
        
        return null;
      }

      // Log success for audit
      await logAuditEvent({
        action: "transaction_creation",
        category: AuditLogCategory.SFD_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: this.userId,
        details: { 
          transaction_id: data.id, 
          type, 
          amount, 
          sfd_id: this.sfdId 
        }
      });

      return data as Transaction;
    } catch (error: any) {
      console.error('Transaction creation failed:', error);
      return null;
    }
  }

  /**
   * Retrieves transaction history
   */
  async getTransactionHistory(limit: number = 10): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', this.userId)
        .eq('sfd_id', this.sfdId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error retrieving transaction history:', error);
        return [];
      }

      return data as Transaction[];
    } catch (error) {
      console.error('Failed to retrieve transaction history:', error);
      return [];
    }
  }

  /**
   * Retrieves current account balance
   */
  async getAccountBalance(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', this.userId)
        .single();

      if (error) {
        console.error('Error retrieving balance:', error);
        return 0;
      }

      return data.balance || 0;
    } catch (error) {
      console.error('Failed to retrieve balance:', error);
      return 0;
    }
  }
}
