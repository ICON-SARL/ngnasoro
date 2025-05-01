
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
  async createSavingsAccount(userId: string, sfdId: string, initialBalance: number = 0): Promise<SavingsAccount | null> {
    try {
      console.log("Création d'un compte d'épargne avec:", { userId, sfdId, initialBalance });
      
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingAccount) {
        console.log("Compte existant trouvé:", existingAccount);
        return existingAccount as SavingsAccount;
      }
      
      console.log("Création d'un nouveau compte...");
      
      // Create new account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          balance: initialBalance,
          currency: 'FCFA',
          sfd_id: sfdId,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erreur lors de la création du compte:", error);
        throw error;
      }
      
      console.log("Compte créé avec succès:", data);
      
      // Log the account creation
      await logAuditEvent({
        action: 'client_account_created',
        category: AuditLogCategory.SFD_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: userId,
        details: { 
          sfd_id: sfdId,
          initial_balance: initialBalance 
        }
      });

      // Create initial deposit if balance > 0
      if (initialBalance > 0) {
        console.log("Création du dépôt initial...");
        await this.processTransaction({
          clientId: userId,
          amount: initialBalance,
          description: 'Dépôt initial',
          adminId: userId,
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
      console.log("Traitement de la transaction:", options);
      
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
      
      if (txError) {
        console.error("Erreur lors de la création de la transaction:", txError);
        throw txError;
      }

      console.log("Transaction créée:", transaction);

      // Update the account balance directly
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', clientId)
        .single();

      if (accError) {
        console.error("Erreur lors de la récupération du compte:", accError);
        throw accError;
      }

      const newBalance = (account.balance || 0) + transactionAmount;
      
      console.log("Mise à jour du solde:", { ancien: account.balance, nouveau: newBalance });
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ 
          balance: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', clientId);

      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        throw updateError;
      }
      
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
      
      console.log("Transaction complétée avec succès");
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
      // First, get the user_id associated with the client
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        console.error("Client not found or no user_id:", clientError);
        return null;
      }
      
      // Then get the account using the user_id
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching account:", error);
        throw error;
      }
      
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
      // First, get the user_id associated with the client
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        console.error("Client not found or no user_id:", clientError);
        return [];
      }
      
      // Then get the transactions using the user_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      
      return data as SavingsTransaction[];
    } catch (error: any) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }
};
