
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/types/transactions";
import { sfdAccountService } from "./sfdAccountService";

export interface TransferParams {
  fromAccountId: string;
  toAccountId?: string;
  recipientPhone?: string;
  recipientName?: string;
  amount: number;
  description?: string;
  transferType: 'internal' | 'external' | 'mobile_money';
  scheduledDate?: Date;
}

export const transferService = {
  /**
   * Effectuer un transfert interne entre comptes
   */
  async transferFunds(params: TransferParams): Promise<Transaction | null> {
    try {
      // Récupérer le user ID actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // Si c'est un transfert interne (entre comptes SFD)
      if (params.transferType === 'internal' && params.toAccountId) {
        const result = await sfdAccountService.transferBetweenAccounts({
          sfdId: params.fromAccountId.split('-')[0], // Extraire l'ID SFD depuis fromAccountId
          fromAccountId: params.fromAccountId,
          toAccountId: params.toAccountId,
          amount: params.amount,
          description: params.description
        });
        
        if (!result) throw new Error("Échec du transfert entre comptes");
        
        // Créer un enregistrement de transaction
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            sfd_id: params.fromAccountId.split('-')[0],
            type: 'transfer',
            amount: params.amount,
            description: params.description || 'Transfert entre comptes',
            reference: result,
            payment_method: 'sfd_account' as any,
            status: 'completed' as any
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as Transaction;
      }
      
      // Si c'est un transfert externe (mobile money)
      else if (params.transferType === 'mobile_money' && params.recipientPhone) {
        // Appeler l'API de mobile money
        const { data, error } = await supabase.functions.invoke('sfd-account-transfer', {
          body: {
            sfdId: params.fromAccountId.split('-')[0],
            fromAccountId: params.fromAccountId,
            toPhone: params.recipientPhone,
            amount: params.amount,
            description: params.description || `Transfert vers ${params.recipientPhone}`
          }
        });

        if (error) throw error;
        
        // Créer un enregistrement de transaction
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            sfd_id: params.fromAccountId.split('-')[0],
            type: 'transfer',
            amount: params.amount,
            description: params.description || `Transfert Mobile Money: ${params.recipientPhone}`,
            reference: data.transferId || 'mm-transfer',
            payment_method: 'mobile_money' as any,
            status: (data.success ? 'completed' : 'failed') as any
          })
          .select()
          .single();
          
        if (transactionError) throw transactionError;
        return transactionData as Transaction;
      }
      
      // Si c'est un transfert programmé
      else if (params.scheduledDate) {
        // Instead of trying to use a non-existent table, we'll create a regular transaction 
        // with a specific status indicating it's scheduled
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            sfd_id: params.fromAccountId.split('-')[0],
            type: 'transfer',
            amount: params.amount,
            description: params.description || `Transfert programmé pour ${params.scheduledDate.toISOString()}`,
            payment_method: (params.transferType === 'mobile_money' ? 'mobile_money' : 'sfd_account') as any,
            status: 'pending' as any,
            reference: `scheduled-${new Date().getTime()}`
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as Transaction;
      }
      
      throw new Error("Type de transfert non pris en charge");
    } catch (error) {
      console.error("Erreur lors du transfert:", error);
      return null;
    }
  },
  
  /**
   * Récupérer l'historique des transferts
   */
  async getTransferHistory(userId: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'transfer')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data as Transaction[];
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des transferts:", error);
      return [];
    }
  },
  
  /**
   * Récupérer les contacts récents de l'utilisateur
   */
  async getRecentContacts(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('description, reference')
        .eq('user_id', userId)
        .eq('type', 'transfer')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      // Extraire les informations de contact uniques
      const uniqueContacts = new Map();
      data.forEach(transaction => {
        // Extraire le nom du destinataire du champ description
        const name = transaction.description?.replace('Transfert vers ', '') || 'Contact';
        // Extraire le numéro de téléphone du champ description s'il existe
        const phoneMatch = transaction.description?.match(/\b\d{10,12}\b/);
        const phone = phoneMatch ? phoneMatch[0] : null;
        
        // Utiliser le référence comme clé unique
        if (!uniqueContacts.has(transaction.reference)) {
          uniqueContacts.set(transaction.reference, {
            name,
            phone,
            avatar_url: `/lovable-uploads/64d80661-a6eb-404d-af95-8d0ffeaa0a34.png`
          });
        }
      });
      
      return Array.from(uniqueContacts.values());
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts récents:", error);
      return [];
    }
  }
};
