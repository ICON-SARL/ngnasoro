
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
      const { data, error } = await supabase
        .rpc('transfer_between_sfd_accounts', {
          p_sfd_id: sfdId,
          p_from_account_id: fromAccountId,
          p_to_account_id: toAccountId,
          p_amount: amount,
          p_description: description || "Transfert entre comptes",
          p_performed_by: (await supabase.auth.getUser()).data.user?.id || null
        });

      if (error) throw error;
      return data as string;
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
      const { data, error } = await supabase
        .from('sfd_account_transfers')
        .select('*')
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SfdAccountTransfer[];
    } catch (error) {
      handleError(error);
      return [];
    }
  }
};
