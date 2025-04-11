
import { supabase } from '@/integrations/supabase/client';
import { LoanPaymentParams, SfdBalanceData, SyncResult } from './types';

/**
 * Synchronize accounts data from SFD
 */
export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  try {
    // Call the edge function to sync the accounts
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { 
        userId,
        forceSync: true
      }
    });
    
    if (error) {
      console.error('Error synchronizing accounts:', error);
      throw error;
    }
    
    // Check if the synchronization was successful
    if (!data?.success) {
      throw new Error(data?.message || 'Synchronization failed');
    }
    
    return data as SyncResult;
  } catch (error: any) {
    console.error('Account synchronization error:', error);
    throw new Error(error.message || 'Failed to synchronize accounts');
  }
}

/**
 * Get balance for a specific SFD account
 */
export async function getSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
  try {
    // Call the edge function to get the balance
    const { data, error } = await supabase.functions.invoke('get-sfd-balance', {
      body: { 
        userId,
        sfdId
      }
    });
    
    if (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
    
    // Return the balance data
    return {
      balance: data?.balance || 0,
      currency: data?.currency || 'FCFA'
    };
  } catch (error: any) {
    console.error('Balance retrieval error:', error);
    return {
      balance: 0,
      currency: 'FCFA'
    };
  }
}

/**
 * Process a loan payment
 */
export async function processLoanPayment(
  userId: string,
  sfdId: string,
  params: LoanPaymentParams
): Promise<SyncResult> {
  try {
    // Call the edge function to process the payment
    const { data, error } = await supabase.functions.invoke('process-loan-payment', {
      body: { 
        userId,
        sfdId,
        loanId: params.loanId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        reference: params.reference
      }
    });
    
    if (error) {
      console.error('Error processing loan payment:', error);
      throw error;
    }
    
    // Check if the payment was successful
    if (!data?.success) {
      throw new Error(data?.message || 'Payment failed');
    }
    
    return data as SyncResult;
  } catch (error: any) {
    console.error('Loan payment error:', error);
    throw new Error(error.message || 'Failed to process loan payment');
  }
}
