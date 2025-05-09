
import { supabase } from '@/integrations/supabase/client';
import { SyncResult, LoanPaymentParams } from './types';

// Process loan payment
export async function processLoanPayment(
  userId: string,
  sfdId: string,
  params: LoanPaymentParams
): Promise<SyncResult> {
  try {
    // First validate the user has access to this loan
    const { data: loanData, error: loanError } = await supabase
      .from('sfd_loans')
      .select('id')
      .eq('id', params.loanId)
      .eq('client_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
    
    if (loanError || !loanData) {
      throw new Error('Unauthorized access to loan');
    }
    
    // Process the payment
    const { data, error } = await supabase.functions.invoke('process-loan-payment', {
      body: {
        userId,
        sfdId,
        loanId: params.loanId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        description: params.description || 'Loan payment', // Added default value
        reference: params.reference || ''
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      message: data?.message || 'Payment processed successfully'
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
