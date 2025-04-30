
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

// Interface for savings account data
export interface SavingsAccount {
  id: string;
  user_id: string;
  client_id?: string;
  balance: number;
  currency: string;
  status?: 'active' | 'frozen' | 'closed';
  created_at?: string;
  updated_at: string;
  last_transaction_date?: string;
  last_updated?: string;
  sfd_id: string;
}

// Interface for transaction options
export interface SavingsTransactionOptions {
  clientId: string;
  amount: number;
  description?: string;
  adminId: string;
  transactionType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  referenceId?: string;
  sfdId: string;
}

// Interface for transaction data
export interface SavingsTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  payment_method?: string;
  reference_id?: string;
  sfd_id?: string;
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

      // Create initial deposit if balance > 0
      if (initialBalance > 0) {
        await this.processTransaction({
          clientId,
          amount: initialBalance,
          description: 'Dépôt initial',
          adminId: clientId,
          transactionType: 'deposit',
          referenceId: `initial-${Date.now()}`,
          sfdId: sfdId
        });
      }
      
      return data as SavingsAccount;
    } catch (error: any) {
      console.error('Failed to create savings account:', error);
      throw new Error(error.message || 'Échec de la création du compte');
    }
  },
  
  /**
   * Process a transaction on a savings account
   */
  async processTransaction(options: SavingsTransactionOptions): Promise<boolean> {
    const { clientId, amount, description, adminId, transactionType, referenceId, sfdId } = options;
    
    try {
      // For withdrawals, make the amount negative
      const transactionAmount = transactionType === 'deposit' || transactionType === 'loan_disbursement' 
        ? Math.abs(amount) 
        : -Math.abs(amount);

      // Create the transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: transactionAmount,
          type: transactionType,
          name: description || `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`,
          description: description || `Transaction de type ${transactionType}`,
          status: 'success',
          payment_method: 'sfd_account',
          reference_id: referenceId || `tx-${Date.now()}`,
          sfd_id: sfdId
        })
        .select()
        .single();
      
      if (txError) throw txError;

      // Update the account balance directly
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', clientId)
        .single();

      if (accError) throw accError;

      const newBalance = (account.balance || 0) + transactionAmount;
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ 
          balance: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', clientId);

      if (updateError) throw updateError;
      
      // Log the transaction
      await logAuditEvent({
        action: `client_account_${transactionType}`,
        category: AuditLogCategory.SFD_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: adminId,
        details: { 
          client_id: clientId,
          amount: transactionAmount,
          transaction_id: transaction.id,
          sfd_id: sfdId
        }
      });
      
      return true;
    } catch (error: any) {
      console.error(`Failed to process ${transactionType}:`, error);
      
      // Log the failed transaction
      await logAuditEvent({
        action: `client_account_${transactionType}_failed`,
        category: AuditLogCategory.SFD_OPERATIONS,
        severity: AuditLogSeverity.ERROR,
        status: 'failure',
        user_id: adminId,
        details: { 
          client_id: clientId,
          amount,
          error_message: (error as Error).message,
          sfd_id: sfdId
        }
      });
      
      throw error;
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
        .maybeSingle();
      
      if (error) throw error;
      return data as SavingsAccount;
    } catch (error: any) {
      console.error('Failed to fetch client account:', error);
      return null;
    }
  },
  
  /**
   * Get a client's transaction history
   */
  async getTransactionHistory(clientId: string, limit: number = 20): Promise<SavingsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as SavingsTransaction[];
    } catch (error: any) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }
};
