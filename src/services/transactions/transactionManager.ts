
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/services/transactionService';

export interface TransactionParams {
  amount: number;
  type: 'deposit' | 'withdrawal' | 'loan_repayment' | 'loan_disbursement';
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
  name?: string;
}

export class TransactionManager {
  private userId: string;
  private sfdId: string;

  constructor(userId: string, sfdId: string) {
    this.userId = userId;
    this.sfdId = sfdId;
  }

  /**
   * Crée une nouvelle transaction
   */
  async createTransaction(params: TransactionParams): Promise<Transaction | null> {
    try {
      const { amount, type, description, paymentMethod, referenceId, name } = params;
      
      // Préparer les données pour la base de données
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

      // Insérer la transaction dans la base de données
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la transaction:', error);
        
        // Logger l'erreur pour audit
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

      // Logger le succès pour audit
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
      console.error('Échec de la création de transaction:', error);
      return null;
    }
  }

  /**
   * Effectue un dépôt
   */
  async makeDeposit(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Le montant du dépôt doit être supérieur à 0');
    }

    return this.createTransaction({
      amount: amount,
      type: 'deposit',
      description: description || 'Dépôt dans le compte SFD',
      paymentMethod,
      name: 'Dépôt'
    });
  }

  /**
   * Effectue un retrait
   */
  async makeWithdrawal(amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Le montant du retrait doit être supérieur à 0');
    }

    // Vérifier si le solde est suffisant
    const { data: account, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', this.userId)
      .single();

    if (error || !account) {
      throw new Error('Impossible de vérifier le solde du compte');
    }

    if (account.balance < amount) {
      throw new Error('Solde insuffisant pour effectuer ce retrait');
    }

    return this.createTransaction({
      amount: amount,
      type: 'withdrawal',
      description: description || 'Retrait du compte SFD',
      paymentMethod,
      name: 'Retrait'
    });
  }

  /**
   * Effectue un remboursement de prêt
   */
  async makeLoanRepayment(loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> {
    if (amount <= 0) {
      throw new Error('Le montant du remboursement doit être supérieur à 0');
    }

    return this.createTransaction({
      amount: amount,
      type: 'loan_repayment',
      description: description || `Remboursement du prêt ${loanId}`,
      paymentMethod,
      referenceId: loanId,
      name: 'Remboursement de prêt'
    });
  }

  /**
   * Récupérer l'historique des transactions
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
        console.error('Erreur lors de la récupération de l\'historique des transactions:', error);
        return [];
      }

      return data as Transaction[];
    } catch (error) {
      console.error('Échec de la récupération de l\'historique des transactions:', error);
      return [];
    }
  }

  /**
   * Récupérer le solde actuel du compte
   */
  async getAccountBalance(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', this.userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du solde:', error);
        return 0;
      }

      return data.balance || 0;
    } catch (error) {
      console.error('Échec de la récupération du solde:', error);
      return 0;
    }
  }
}

export const createTransactionManager = (userId: string, sfdId: string): TransactionManager => {
  return new TransactionManager(userId, sfdId);
};
