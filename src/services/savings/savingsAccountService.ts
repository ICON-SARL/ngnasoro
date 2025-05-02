
import { supabase } from '@/integrations/supabase/client';

export interface SavingsAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  last_updated?: string;
  updated_at?: string;
  created_at?: string;
  sfd_id?: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_repayment' | 'loan_disbursement' | 'reversal' | 'other' | string;
  amount: number;
  name: string;
  description?: string;
  created_at: string;
  reference_id?: string;
  status: string;
  payment_method?: string;
  avatar_url?: string;
  provider_reference?: string;
  date?: string;
  sfd_id?: string;
}

export interface SavingsTransactionOptions {
  userId: string;
  amount: number;
  description?: string;
  transactionType: 'deposit' | 'withdrawal';
  adminId?: string;
  sfdId: string;
}

export const savingsAccountService = {
  /**
   * Get client's savings account
   */
  getClientAccount: async (clientId: string): Promise<SavingsAccount | null> => {
    try {
      // First, get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !client?.user_id) {
        console.log("No user_id found for client", clientId);
        return null;
      }
        
      // Then get the account using the user_id
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching client account:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching client account:", error);
      return null;
    }
  },
  
  /**
   * Get transaction history for a client
   */
  getTransactionHistory: async (clientId: string): Promise<SavingsTransaction[]> => {
    try {
      // First, get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !client?.user_id) {
        console.log("No user_id found for client", clientId);
        return [];
      }
        
      // Then get transactions using the user_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching client transactions:", error);
        return [];
      }
      
      return data as SavingsTransaction[];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  },
  
  /**
   * Create a new savings account for a client
   */
  createSavingsAccount: async (userId: string, sfdId: string, initialBalance: number = 0): Promise<SavingsAccount> => {
    try {
      console.log(`Creating savings account for user ${userId} with SFD ${sfdId}`);
      
      // First check if account already exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingAccount) {
        console.log("Account already exists for user", userId);
        return existingAccount;
      }
      
      // Create new account if it doesn't exist
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: userId,
            balance: initialBalance,
            currency: 'FCFA',
            sfd_id: sfdId
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating savings account:", error);
        throw error;
      }
      
      // If initial balance is greater than 0, create an initial deposit transaction
      if (initialBalance > 0) {
        await savingsAccountService.processTransaction({
          userId,
          amount: initialBalance,
          transactionType: 'deposit',
          description: 'Dépôt initial',
          sfdId
        });
      }
      
      return data;
    } catch (error) {
      console.error("Error creating savings account:", error);
      throw error;
    }
  },
  
  /**
   * Process a transaction (deposit or withdrawal)
   */
  processTransaction: async (options: SavingsTransactionOptions): Promise<SavingsTransaction> => {
    const { userId, amount, description, transactionType, adminId, sfdId } = options;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: transactionType === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount),
            name: transactionType === 'deposit' ? 'Dépôt' : 'Retrait',
            type: transactionType,
            description: description || (transactionType === 'deposit' ? 'Dépôt en espèces' : 'Retrait en espèces'),
            sfd_id: sfdId
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error("Error processing transaction:", error);
        throw error;
      }
      
      return data as SavingsTransaction;
    } catch (error) {
      console.error("Error processing transaction:", error);
      throw error;
    }
  },

  /**
   * Ensure client has a savings account
   */
  ensureClientSavingsAccount: async (clientId: string, sfdId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('ensure-client-savings', {
        body: { clientId, sfdId }
      });

      if (error) {
        console.error('Error ensuring savings account:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error calling ensure-client-savings function:', error);
      return false;
    }
  }
};
