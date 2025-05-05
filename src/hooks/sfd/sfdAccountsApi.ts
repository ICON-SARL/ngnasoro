
import { supabase } from '@/integrations/supabase/client';
import { LoanPaymentParams, SyncResult } from './types';

// Synchronize accounts with SFD
export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { userId, forceFullSync: true }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      message: 'Accounts synchronized successfully',
      syncedAccounts: data?.syncedAccounts || []
    };
  } catch (err: any) {
    console.error('Failed to synchronize accounts:', err);
    return {
      success: false,
      message: err.message || 'Failed to synchronize accounts',
      error: err
    };
  }
}

// Process loan payment
export async function processLoanPayment(
  userId: string, 
  sfdId: string, 
  params: LoanPaymentParams
): Promise<{ success: boolean; message?: string; error?: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('process-loan-payment', {
      body: { userId, sfdId, ...params }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      message: 'Payment processed successfully'
    };
  } catch (err: any) {
    console.error('Failed to process loan payment:', err);
    return {
      success: false,
      message: err.message || 'Failed to process payment',
      error: err
    };
  }
}
