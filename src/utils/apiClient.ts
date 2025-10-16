
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import { sfdApi } from '@/utils/api/modules/sfdApi';

// Type pour les stats du dashboard MEREF
export interface MerefDashboardStats {
  activeSfds: number;
  activeUsers: number;
  pendingRequests: number;
  totalTransactions: number;
}

// SFD Client Account type
export interface SfdClientAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

// Transaction result type
export interface TransactionResult {
  success: boolean;
  error?: string;
  transaction_id?: string;
  updated_balance?: number;
}

// QR Code result type
export interface QRCodeResult {
  success: boolean;
  error?: string;
  qr_code_url?: string;
  qr_code_data?: string;
  expires_at?: string;
}

export const apiClient = {
  // Direct access to supabase client for convenience
  supabase,

  // Récupère les statistiques du dashboard MEREF
  async getMerefDashboardStats(userId: string): Promise<MerefDashboardStats> {
    try {
      // Vérifier s'il y a des SFDs actives
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name')
        .eq('status', 'active');
        
      if (sfdsError) throw sfdsError;
      
      // Vérifier les demandes en attente
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select('id')
        .eq('status', 'pending');
        
      if (requestsError) throw requestsError;
      
      // Vérifier le nombre d'utilisateurs
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
        
      if (userError) throw userError;
      
      return {
        activeSfds: sfds?.length || 0,
        activeUsers: userCount || 0,
        pendingRequests: requests?.length || 0,
        totalTransactions: 0 // À implémenter plus tard si nécessaire
      };
    } catch (error) {
      console.error('Error fetching MEREF dashboard stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        activeSfds: 0,
        activeUsers: 0,
        pendingRequests: 0,
        totalTransactions: 0
      };
    }
  },

  // Client Account Operations
  async createClientAccount(clientId: string, sfdId: string, initialBalance: number = 0): Promise<SfdClientAccount | null> {
    try {
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
      return data as SfdClientAccount;
    } catch (error) {
      console.error('Error creating client account:', error);
      return null;
    }
  },

  // Process a deposit
  async processDeposit(
    clientId: string,
    amount: number,
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ): Promise<TransactionResult> {
    try {
      // Get client's SFD
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('sfd_id')
        .eq('user_id', clientId)
        .single();

      // Create a transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          sfd_id: client?.sfd_id || '',
          amount: amount,
          type: 'deposit',
          description: description || 'Dépôt effectué par administrateur',
          status: 'completed' as any,
          payment_method: paymentMethod as any,
          reference: `dep-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true,
        transaction_id: data.id
      };
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du traitement du dépôt'
      };
    }
  },

  // Process a withdrawal
  async processWithdrawal(
    clientId: string,
    amount: number,
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ): Promise<TransactionResult> {
    try {
      // Check if client has enough balance
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', clientId)
        .single();
        
      if (accountError) throw accountError;
      
      if ((account?.balance || 0) < amount) {
        return {
          success: false,
          error: 'Solde insuffisant pour effectuer ce retrait'
        };
      }
      
      // Get client's SFD
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('sfd_id')
        .eq('user_id', clientId)
        .single();
      
      // Create a transaction with negative amount
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          sfd_id: client?.sfd_id || '',
          amount: -amount, // Negative for withdrawal
          type: 'withdrawal',
          description: description || 'Retrait effectué par administrateur',
          status: 'completed' as any,
          payment_method: paymentMethod as any,
          reference: `wit-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true,
        transaction_id: data.id
      };
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du traitement du retrait'
      };
    }
  },

  // Process a loan disbursement
  async processLoanDisbursement(
    clientId: string,
    loanId: string,
    amount: number,
    adminId: string,
    description?: string
  ): Promise<TransactionResult> {
    try {
      // Get client's SFD
      const { data: clientData } = await supabase
        .from('sfd_clients')
        .select('sfd_id')
        .eq('id', clientId)
        .single();

      // Create a transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          sfd_id: clientData?.sfd_id || '',
          amount: amount,
          type: 'loan_disbursement',
          description: description || `Décaissement du prêt #${loanId}`,
          status: 'completed' as any,
          payment_method: 'cash' as any,
          reference: loanId
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update loan disbursement status
      const { error: loanError } = await supabase
        .from('sfd_loans')
        .update({
          disbursed_at: new Date().toISOString(),
          disbursement_status: 'completed',
          status: 'active'
        })
        .eq('id', loanId);
        
      if (loanError) {
        console.error('Error updating loan status:', loanError);
      }

      return { 
        success: true,
        transaction_id: data.id
      };
    } catch (error: any) {
      console.error('Error processing loan disbursement:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du traitement du décaissement'
      };
    }
  },

  // Process mobile money transaction
  async processMobileMoneyTransaction(
    clientId: string,
    amount: number,
    phoneNumber: string,
    provider: string,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string,
    description?: string
  ): Promise<TransactionResult> {
    try {
      // Call the edge function for mobile money processing
      const response = await edgeFunctionApi.callFunction<TransactionResult>(
        'process-mobile-money',
        {
          clientId,
          amount,
          phoneNumber,
          provider,
          transactionType,
          adminId,
          description
        }
      );

      if (!response.success) {
        throw new Error(response.message || 'Échec de la transaction Mobile Money');
      }

      return {
        success: true,
        transaction_id: response.data?.transaction_id
      };
    } catch (error: any) {
      console.error('Error processing mobile money transaction:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors du traitement de la transaction Mobile Money'
      };
    }
  },

  // Generate QR code for transaction - Note: qr_codes table doesn't exist
  async generateTransactionQRCode(
    clientId: string,
    amount: number,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string
  ): Promise<QRCodeResult> {
    console.warn('QR codes feature not yet implemented - table does not exist');
    return {
      success: false,
      error: 'QR codes feature not yet implemented'
    };
  },

  // Process QR code transaction - Note: qr_codes table doesn't exist
  async processQRCodeTransaction(
    qrCodeData: string,
    adminId: string
  ): Promise<TransactionResult> {
    console.warn('QR codes feature not yet implemented - table does not exist');
    return {
      success: false,
      error: 'QR codes feature not yet implemented'
    };
  },

  // Get SFD loans
  async getSfdLoans(userId: string, sfdId: string) {
    return await sfdApi.getSfdLoans(userId, sfdId);
  },

  // Get SFD balance
  async getSfdBalance(userId: string, sfdId: string) {
    return await sfdApi.getSfdBalance(userId, sfdId);
  },

  // Call edge function (wrapper)
  async callEdgeFunction(functionName: string, payload: any) {
    return await edgeFunctionApi.callFunction(functionName, payload);
  },

  // Get client account details
  async getClientAccount(userId: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching client account:', error);
      return {
        id: null,
        user_id: userId,
        balance: 0,
        currency: 'FCFA',
        updated_at: new Date().toISOString()
      };
    }
  }
};
