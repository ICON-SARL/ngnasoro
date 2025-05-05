
import { supabase } from '@/integrations/supabase/client';
import { SyncResult, LoanPaymentParams } from './types';

// Function to synchronize accounts with the SFD API
export async function synchronizeAccounts(userId: string): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
      body: { userId }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      syncedAccounts: data?.accounts || [],
      message: 'Comptes synchronisés avec succès'
    };
  } catch (error: any) {
    console.error('Error synchronizing accounts:', error);
    return {
      success: false,
      error,
      message: error.message || 'Une erreur est survenue lors de la synchronisation'
    };
  }
}

// Function to process a loan payment
export async function processLoanPayment(
  userId: string,
  sfdId: string,
  params: LoanPaymentParams
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('process-repayment', {
      body: {
        userId,
        sfdId,
        loanId: params.loanId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        description: params.description,
        reference: params.reference
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Paiement traité avec succès'
    };
  } catch (error: any) {
    console.error('Error processing loan payment:', error);
    return {
      success: false,
      message: error.message || 'Une erreur est survenue lors du traitement du paiement'
    };
  }
}
