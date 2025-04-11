
import { supabase } from '@/integrations/supabase/client';

export interface SfdClientAccount {
  id: string;
  user_id: string;
  client_id?: string;  // Made optional since it might not always be provided
  balance: number;
  currency: string;
  sfd_id: string;
  updated_at: string;
  last_updated?: string; // Added to match database schema
}

export interface ClientTransactionResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

// SFD Client API operations
export const sfdClientApi = {
  /**
   * Get client account details
   */
  getClientAccount: async (clientId: string): Promise<SfdClientAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (error) throw error;
      
      // Convert to SfdClientAccount type with required fields
      return {
        ...data,
        client_id: clientId,
        sfd_id: data.sfd_id || '' // The database may not have this field, provide default
      } as SfdClientAccount;
    } catch (error) {
      console.error('Error fetching client account:', error);
      return null;
    }
  },
  
  /**
   * Create account for a client if it doesn't exist
   */
  createClientAccount: async (
    clientId: string, 
    sfdId: string, 
    initialBalance: number = 0
  ): Promise<SfdClientAccount | null> => {
    try {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (existingAccount) {
        // Return with required fields
        return {
          ...existingAccount,
          client_id: clientId,
          sfd_id: sfdId // Ensure sfd_id is set correctly
        } as SfdClientAccount;
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
      
      // Return with required fields
      return {
        ...data,
        client_id: clientId,
        sfd_id: sfdId
      } as SfdClientAccount;
    } catch (error) {
      console.error('Error creating client account:', error);
      return null;
    }
  },
  
  /**
   * Process a deposit for client
   */
  processDeposit: async (
    clientId: string, 
    amount: number, 
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ): Promise<ClientTransactionResult> => {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than zero' };
      }
      
      // Create transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: amount,
          type: 'deposit',
          name: 'Dépôt',
          description: description || 'Dépôt sur compte client',
          status: 'success',
          payment_method: paymentMethod,
          reference_id: `dep-${Date.now()}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Record admin activity with severity field added
      await supabase.from('audit_logs').insert({
        user_id: adminId,
        action: 'client_deposit',
        category: 'financial',
        severity: 'info',  // Add required severity field
        status: 'success',
        details: {
          client_id: clientId,
          amount,
          transaction_id: data.id
        }
      });
      
      return { 
        success: true, 
        transaction_id: data.id 
      };
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process deposit' 
      };
    }
  },
  
  /**
   * Process a withdrawal for client
   */
  processWithdrawal: async (
    clientId: string, 
    amount: number, 
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ): Promise<ClientTransactionResult> => {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than zero' };
      }
      
      // Get account balance
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', clientId)
        .single();
      
      if (accountError) throw accountError;
      
      if (!account || account.balance < amount) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      // Create transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: -amount, // Negative amount for withdrawal
          type: 'withdrawal',
          name: 'Retrait',
          description: description || 'Retrait du compte client',
          status: 'success',
          payment_method: paymentMethod,
          reference_id: `wit-${Date.now()}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Record admin activity with severity field added
      await supabase.from('audit_logs').insert({
        user_id: adminId,
        action: 'client_withdrawal',
        category: 'financial',
        severity: 'info',  // Add required severity field
        status: 'success',
        details: {
          client_id: clientId,
          amount,
          transaction_id: data.id
        }
      });
      
      return { 
        success: true, 
        transaction_id: data.id 
      };
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process withdrawal' 
      };
    }
  },
  
  /**
   * Process a loan disbursement
   */
  processLoanDisbursement: async (
    clientId: string,
    loanId: string,
    amount: number,
    adminId: string,
    description?: string
  ): Promise<ClientTransactionResult> => {
    try {
      // Verify the loan belongs to the client
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('id, client_id, status')
        .eq('id', loanId)
        .eq('client_id', clientId)
        .single();
      
      if (loanError || !loan) {
        return { success: false, error: 'Loan not found or does not belong to this client' };
      }
      
      if (loan.status !== 'approved') {
        return { success: false, error: 'Loan must be in approved status to disburse' };
      }
      
      // Create transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: amount,
          type: 'loan_disbursement',
          name: 'Décaissement de prêt',
          description: description || `Décaissement du prêt ${loanId}`,
          status: 'success',
          payment_method: 'sfd_account',
          reference_id: loanId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update loan status
      await supabase
        .from('sfd_loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('id', loanId);
      
      // Record loan activity
      await supabase.from('loan_activities').insert({
        loan_id: loanId,
        activity_type: 'disbursement',
        description: `Loan of ${amount} FCFA disbursed to client account`,
        performed_by: adminId
      });
      
      // Record admin activity with severity field added
      await supabase.from('audit_logs').insert({
        user_id: adminId,
        action: 'loan_disbursement',
        category: 'financial',
        severity: 'info',  // Add required severity field
        status: 'success',
        details: {
          client_id: clientId,
          loan_id: loanId,
          amount,
          transaction_id: data.id
        },
        target_resource: `loan:${loanId}`
      });
      
      return { 
        success: true, 
        transaction_id: data.id 
      };
    } catch (error: any) {
      console.error('Error processing loan disbursement:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process loan disbursement' 
      };
    }
  },
  
  /**
   * Process a transaction via Mobile Money
   */
  processMobileMoneyTransaction: async (
    clientId: string,
    amount: number,
    phoneNumber: string,
    provider: string,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string,
    description?: string
  ): Promise<ClientTransactionResult> => {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than zero' };
      }
      
      // For withdrawals, check sufficient funds
      if (transactionType === 'withdrawal') {
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', clientId)
          .single();
        
        if (accountError) throw accountError;
        
        if (!account || account.balance < amount) {
          return { success: false, error: 'Insufficient funds' };
        }
      }
      
      // Call mobile money verification edge function
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'mobileMoney',
          userId: adminId,
          clientId: clientId,
          phoneNumber,
          amount,
          provider,
          isWithdrawal: transactionType === 'withdrawal'
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        return { success: false, error: data.message || 'Mobile money transaction failed' };
      }
      
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: transactionType === 'withdrawal' ? -amount : amount,
          type: transactionType,
          name: `${provider.toUpperCase()} ${transactionType === 'withdrawal' ? 'Retrait' : 'Dépôt'}`,
          description: description || `${transactionType === 'withdrawal' ? 'Retrait' : 'Dépôt'} via ${provider.toUpperCase()} Mobile Money`,
          status: 'success',
          payment_method: 'mobile_money',
          reference_id: data.reference || `mm-${Date.now()}`
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Record admin activity with severity field added
      await supabase.from('audit_logs').insert({
        user_id: adminId,
        action: `client_${transactionType}_mobile_money`,
        category: 'financial',
        severity: 'info',  // Add required severity field
        status: 'success',
        details: {
          client_id: clientId,
          amount,
          provider,
          phone_number: phoneNumber,
          transaction_id: transaction.id
        }
      });
      
      return { 
        success: true, 
        transaction_id: transaction.id 
      };
    } catch (error: any) {
      console.error('Error processing mobile money transaction:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process mobile money transaction' 
      };
    }
  },
  
  /**
   * Generate QR code for in-agency transaction
   */
  generateTransactionQRCode: async (
    clientId: string,
    amount: number,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string
  ): Promise<{ success: boolean; qrCodeData?: string; error?: string }> => {
    try {
      // Generate QR code via edge function
      const { data, error } = await supabase.functions.invoke('mobile-money-verification', {
        body: {
          action: 'qrCode',
          userId: adminId,
          clientId: clientId,
          amount,
          isWithdrawal: transactionType === 'withdrawal'
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to generate QR code' };
      }
      
      // Record admin activity with severity field added
      await supabase.from('audit_logs').insert({
        user_id: adminId,
        action: `qr_code_generated_${transactionType}`,
        category: 'financial',
        severity: 'info',  // Add required severity field
        status: 'success',
        details: {
          client_id: clientId,
          amount,
          qr_code_id: data.qrCode?.code
        }
      });
      
      // Return QR code data for display
      return { 
        success: true, 
        qrCodeData: JSON.stringify(data.qrCode)
      };
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to generate QR code' 
      };
    }
  },
  
  /**
   * Process a transaction with QR code verification
   */
  processQRCodeTransaction: async (
    qrCodeData: string,
    adminId: string
  ): Promise<ClientTransactionResult> => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(qrCodeData);
      
      if (!qrData.userId || !qrData.amount || qrData.timestamp == null) {
        return { success: false, error: 'Invalid QR code data' };
      }
      
      // Check if QR code is expired
      const expirationTime = new Date(qrData.expiresAt).getTime();
      if (Date.now() > expirationTime) {
        return { success: false, error: 'QR code has expired' };
      }
      
      // Process the transaction based on type
      if (qrData.isWithdrawal) {
        return await sfdClientApi.processWithdrawal(
          qrData.userId,
          qrData.amount,
          adminId,
          'Retrait via QR code en agence',
          'qr_code'
        );
      } else {
        return await sfdClientApi.processDeposit(
          qrData.userId,
          qrData.amount,
          adminId,
          'Dépôt via QR code en agence',
          'qr_code'
        );
      }
    } catch (error: any) {
      console.error('Error processing QR code transaction:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process QR code transaction' 
      };
    }
  }
};
