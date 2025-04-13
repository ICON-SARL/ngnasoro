
import { supabase } from '@/integrations/supabase/client';
import { LoanPaymentParams, SfdBalanceData, SyncResult } from './types';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

/**
 * Synchronize accounts data from SFD
 */
export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required for synchronization',
        updates: []
      };
    }

    // Use the edgeFunctionApi to handle the call more gracefully
    const data = await edgeFunctionApi.callEdgeFunction('synchronize-sfd-accounts', { 
      userId,
      forceSync: true
    }, { showToast: false });
    
    // Handle the case where the function returns a response but might not have data
    if (!data || !data.success) {
      return {
        success: false,
        message: data?.message || 'Synchronization failed: No response from server',
        updates: []
      };
    }
    
    return data as SyncResult;
  } catch (error: any) {
    console.error('Account synchronization error:', error);
    
    // Return a well-structured error response
    return {
      success: false,
      message: error.message || 'Failed to synchronize accounts: Network error',
      updates: []
    };
  }
}

/**
 * Get balance for a specific SFD account
 */
export async function getSfdBalance(userId: string, sfdId: string): Promise<SfdBalanceData> {
  try {
    if (!userId || !sfdId) {
      console.error('Missing required parameters for getSfdBalance');
      return {
        balance: 0,
        currency: 'FCFA'
      };
    }

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
    if (!userId || !sfdId || !params.loanId) {
      throw new Error('Missing required parameters for loan payment');
    }

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
