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

export interface SavingsTransactionOptions {
  userId: string;
  amount: number;
  description?: string;
  adminId?: string;
  transactionType: 'deposit' | 'withdrawal';
  sfdId: string;
}

export const savingsAccountService = {
  /**
   * Get a client's savings account
   */
  async getClientSavingsAccount(clientId: string): Promise<SavingsAccount | null> {
    try {
      // First get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        console.error('Error fetching client:', clientError);
        return null;
      }

      // Then get the account using user_id
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching savings account:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getClientSavingsAccount:', error);
      return null;
    }
  },

  /**
   * Get client account - Alias for getClientSavingsAccount
   */
  async getClientAccount(clientId: string): Promise<SavingsAccount | null> {
    return this.getClientSavingsAccount(clientId);
  },

  /**
   * Create a savings account for a client
   */
  async createClientSavingsAccount(clientId: string, sfdId: string, initialBalance: number = 0): Promise<SavingsAccount | null> {
    try {
      // Get the client's user_id first
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        console.error('Error fetching client:', clientError);
        throw new Error('Client not found or missing user_id');
      }
      
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
      
      if (existingAccount) {
        return existingAccount;
      }
      
      // Create new account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: client.user_id,
          balance: initialBalance,
          currency: 'FCFA',
          sfd_id: sfdId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating savings account:', error);
        throw error;
      }
      
      // If initial balance > 0, create initial transaction
      if (initialBalance > 0) {
        await supabase.functions.invoke('client-accounts', {
          body: {
            action: 'deposit',
            amount: initialBalance,
            userId: client.user_id,
            description: 'Dépôt initial lors de la création du compte',
            sfdId: sfdId
          }
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error in createClientSavingsAccount:', error);
      return null;
    }
  },

  /**
   * Create savings account - Alias for createClientSavingsAccount with direct userId
   */
  async createSavingsAccount(userId: string, sfdId: string, initialBalance: number = 0): Promise<SavingsAccount | null> {
    try {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingAccount) {
        return existingAccount;
      }
      
      // Create new account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          balance: initialBalance,
          currency: 'FCFA',
          sfd_id: sfdId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating savings account:', error);
        throw error;
      }
      
      // If initial balance > 0, create initial transaction using edge function
      if (initialBalance > 0) {
        await supabase.functions.invoke('client-accounts', {
          body: {
            action: 'deposit',
            amount: initialBalance,
            userId: userId,
            description: 'Dépôt initial lors de la création du compte',
            sfdId: sfdId
          }
        });
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in createSavingsAccount:', error);
      return null;
    }
  },

  /**
   * Ensure a client has a savings account (create if not exists)
   */
  async ensureClientSavingsAccount(clientId: string, sfdId: string): Promise<boolean> {
    try {
      // Call the Edge Function to ensure the client has a user account & savings account
      const { data, error } = await supabase.functions.invoke('ensure-client-savings', {
        body: { clientId, sfdId }
      });
      
      if (error) {
        console.error('Error ensuring client savings account:', error);
        throw error;
      }
      
      return data?.success || false;
    } catch (error) {
      console.error('Error in ensureClientSavingsAccount:', error);
      return false;
    }
  },
  
  /**
   * Get the balance of a client's savings account
   */
  async getBalance(clientId: string): Promise<number> {
    const account = await this.getClientSavingsAccount(clientId);
    return account?.balance || 0;
  },

  /**
   * Get transaction history for a client
   */
  async getTransactionHistory(clientId: string): Promise<any[]> {
    try {
      // First get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        console.error('Error fetching client:', clientError);
        return [];
      }

      // Then get transactions using user_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      return [];
    }
  },

  /**
   * Process a transaction (deposit or withdrawal) using edge function to bypass RLS
   */
  async processTransaction(options: SavingsTransactionOptions): Promise<boolean> {
    const { userId, amount, description, transactionType, sfdId } = options;
    
    if (!userId || !amount || amount <= 0) {
      throw new Error('Invalid transaction parameters');
    }

    try {
      console.log(`Calling client-accounts edge function with:`, { 
        action: transactionType, 
        userId, 
        amount, 
        description, 
        sfdId 
      });

      // Use edge function to process transaction to bypass RLS
      const { data, error } = await supabase.functions.invoke('client-accounts', {
        body: {
          action: transactionType,
          userId: userId,
          amount: amount,
          description: description || (transactionType === 'deposit' ? 'Dépôt sur compte' : 'Retrait du compte'),
          sfdId: sfdId
        }
      });
      
      if (error) {
        console.error('Error in edge function:', error);
        throw new Error(`Failed to process ${transactionType}: ${error.message}`);
      }
      
      console.log('Edge function response:', data);
      
      if (!data.success) {
        throw new Error(data.message || `Failed to process ${transactionType}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }
};
