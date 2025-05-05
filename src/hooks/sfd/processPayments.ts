
import { supabase } from '@/integrations/supabase/client';
import { SyncResult, LoanPaymentParams } from './types';

// Process loan payment via the Edge Function
export async function processLoanPayment(
  loanId: string, 
  amount: number,
  paymentMethod: string = 'mobile_money',
  description?: string
): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.functions.invoke('process-repayment', {
      body: {
        loanId,
        amount,
        paymentMethod,
        description: description || 'Remboursement de prêt'
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
      error,
      message: error.message || 'Une erreur est survenue lors du traitement du paiement'
    };
  }
}
