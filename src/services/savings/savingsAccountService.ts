
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

// Interface for savings account data
export interface SavingsAccount {
  id: string;
  user_id: string;
  client_id?: string; // Optional since the database table doesn't have this field
  balance: number;
  currency: string;
  status?: 'active' | 'frozen' | 'closed'; // Optional since the database table doesn't have this field
  created_at?: string; // Optional since the database table doesn't have this field
  updated_at: string;
  last_transaction_date?: string;
  last_updated?: string;
}

// Interface for transaction options
export interface SavingsTransactionOptions {
  clientId: string;
  amount: number;
  description?: string;
  adminId: string;
  transactionType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  referenceId?: string;
}

/**
 * Service to manage client savings accounts
 */
export const savingsAccountService = {
  /**
   * Create a new savings account for a client
   */
  async createSavingsAccount(clientId: string, sfdId: string, initialBalance: number = 0): Promise<SavingsAccount | null> {
    try {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (existingAccount) {
        return existingAccount as SavingsAccount;
      }
      
      // Create new account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: clientId,
          balance: initialBalance,
          currency: 'FCFA',
          sfd_id: sfdId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log the account creation
      await logAuditEvent({
        action: 'client_account_created',
        category: AuditLogCategory.SFD_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: clientId,
        details: { 
          sfd_id: sfdId,
          initial_balance: initialBalance 
        }
      });
      
      return data as SavingsAccount;
    } catch (error) {
      console.error('Failed to create savings account:', error);
      return null;
    }
  },
  
  /**
   * Process a transaction on a savings account
   */
  async processTransaction(options: SavingsTransactionOptions): Promise<boolean> {
    const { clientId, amount, description, adminId, transactionType, referenceId } = options;
    
    try {
      // Create the transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: transactionType === 'deposit' || transactionType === 'loan_disbursement' ? amount : -amount,
          type: transactionType,
          name: description || `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`,
          description: description || `Transaction de type ${transactionType}`,
          status: 'success',
          payment_method: 'sfd_account',
          reference_id: referenceId || `tx-${Date.now()}`
        })
        .select()
        .single();
      
      if (txError) throw txError;
      
      // Account balance will be updated automatically via the trigger on transactions
      
      // Log the transaction
      await logAuditEvent({
        action: `client_account_${transactionType}`,
        category: AuditLogCategory.SFD_OPERATIONS, // Changed from FINANCIAL to SFD_OPERATIONS
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: adminId,
        details: { 
          client_id: clientId,
          amount,
          transaction_id: transaction.id
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to process ${transactionType}:`, error);
      
      // Log the failed transaction
      await logAuditEvent({
        action: `client_account_${transactionType}_failed`,
        category: AuditLogCategory.SFD_OPERATIONS, // Changed from FINANCIAL to SFD_OPERATIONS
        severity: AuditLogSeverity.ERROR,
        status: 'failure',
        user_id: adminId,
        details: { 
          client_id: clientId,
          amount,
          error_message: (error as Error).message
        }
      });
      
      return false;
    }
  },
  
  /**
   * Get a client's savings account details
   */
  async getClientAccount(clientId: string): Promise<SavingsAccount | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (error) throw error;
      return data as SavingsAccount;
    } catch (error) {
      console.error('Failed to fetch client account:', error);
      return null;
    }
  },
  
  /**
   * Get a client's transaction history
   */
  async getTransactionHistory(clientId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }
};
