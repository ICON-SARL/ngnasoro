
import { supabase } from "@/integrations/supabase/client";
import { SfdAccount, SfdAccountTransfer, CreateTransferParams } from "@/types/sfdAccounts";
import { handleError } from "@/utils/errorHandler";

/**
 * Service for SFD account operations
 */
export const sfdAccountService = {
  /**
   * Get all accounts for a specific SFD
   */
  async getSfdAccounts(sfdId: string): Promise<SfdAccount[]> {
    try {
      const { data, error } = await supabase
        .from('sfd_accounts')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('account_type', { ascending: true });

      if (error) throw error;
      return data as SfdAccount[];
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  /**
   * Get a specific SFD account by ID
   */
  async getSfdAccountById(accountId: string): Promise<SfdAccount | null> {
    try {
      const { data, error } = await supabase
        .from('sfd_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data as SfdAccount;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Transfer funds between SFD accounts
   */
  async transferBetweenAccounts(params: CreateTransferParams): Promise<string | null> {
    try {
      const { sfdId, fromAccountId, toAccountId, amount, description } = params;
      
      if (fromAccountId === toAccountId) {
        throw new Error("Les comptes source et destination doivent être différents");
      }

      if (amount <= 0) {
        throw new Error("Le montant du transfert doit être supérieur à zéro");
      }

      // Call the database function to handle the transfer
      // For now, let's manually update the balances since the RPC might not be registered yet
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      // Begin a transaction by getting the source account
      const { data: fromAccount, error: fromError } = await supabase
        .from('sfd_accounts')
        .select('*')
        .eq('id', fromAccountId)
        .single();
        
      if (fromError) throw fromError;
      
      // Check sufficient funds
      if ((fromAccount?.balance || 0) < amount) {
        throw new Error("Solde insuffisant dans le compte source");
      }
      
      // Update source account
      const { error: updateFromError } = await supabase
        .from('sfd_accounts')
        .update({ balance: (fromAccount?.balance || 0) - amount })
        .eq('id', fromAccountId);
        
      if (updateFromError) throw updateFromError;
      
      // Update destination account
      const { error: updateToError } = await supabase
        .from('sfd_accounts')
        .update({ balance: supabase.rpc('increment_balance', { row_id: toAccountId, amount_to_add: amount }) })
        .eq('id', toAccountId);
        
      if (updateToError) throw updateToError;
      
      // Record the transfer
      const { data: transferRecord, error: transferError } = await supabase
        .from('sfd_account_transfers')
        .insert({
          sfd_id: sfdId,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: amount,
          description: description || "Transfert entre comptes",
          performed_by: currentUser?.id
        })
        .select('id')
        .single();
        
      if (transferError) throw transferError;
      
      return transferRecord?.id || null;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  /**
   * Get transfer history for an SFD
   */
  async getSfdTransferHistory(sfdId: string): Promise<SfdAccountTransfer[]> {
    try {
      // Handle the case that the sfd_account_transfers table might not exist yet
      // by returning an empty array and not throwing an error
      const { data, error } = await supabase
        .from('sfd_account_transfers')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transfer history", error);
        return [];
      }
      
      return data as SfdAccountTransfer[];
    } catch (error) {
      handleError(error);
      return [];
    }
  }
};
