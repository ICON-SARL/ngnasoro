
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

export type MerefTransactionType = 
  | 'loan_disbursement' 
  | 'loan_repayment' 
  | 'subsidy_allocation' 
  | 'subsidy_disbursement';

export type MerefTransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface MerefTransactionParams {
  sfdId: string;
  clientId?: string;
  amount: number;
  type: MerefTransactionType;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export const merefTransactionService = {
  /**
   * Créer une nouvelle transaction liée au MEREF
   */
  async createTransaction(params: MerefTransactionParams): Promise<Transaction | null> {
    try {
      const userId = params.clientId || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('No user ID available');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          sfd_id: params.sfdId,
          user_id: userId,
          amount: params.amount,
          type: params.type,
          description: params.description || `Transaction de type ${params.type}`,
          reference: params.reference || `meref-${Date.now()}`,
          status: 'completed'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Transaction;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction MEREF:', error);
      return null;
    }
  },

  /**
   * Récupérer les transactions associées à une demande de prêt MEREF
   */
  async getTransactionsByLoanRequestId(loanRequestId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', `meref-loan-${loanRequestId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Transaction[];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions MEREF:', error);
      return [];
    }
  },

  /**
   * Marquer une demande de prêt MEREF comme décaissée
   */
  async disburseLoanRequest(loanRequestId: string, amount: number, sfdId: string, clientId: string): Promise<boolean> {
    try {
      // Créer la transaction de décaissement
      const transaction = await this.createTransaction({
        sfdId,
        clientId,
        amount,
        type: 'loan_disbursement',
        description: 'Décaissement de prêt MEREF',
        reference: `meref-loan-${loanRequestId}`
      });
      
      if (!transaction) {
        throw new Error('Échec de la création de la transaction de décaissement');
      }
      
      // Mettre à jour le statut de la demande de prêt
      const { error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'disbursed',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanRequestId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erreur lors du décaissement du prêt MEREF:', error);
      return false;
    }
  },
  
  /**
   * Récupérer toutes les transactions MEREF
   */
  async getAllMerefTransactions(limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or('type.eq.loan_disbursement,type.eq.loan_repayment,type.eq.subsidy_allocation,type.eq.subsidy_disbursement')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data as Transaction[];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions MEREF:', error);
      return [];
    }
  }
};
