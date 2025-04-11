import { SyncResult, LoanPaymentParams } from './types';

/**
 * Processes a loan payment
 */
export async function processLoanPayment(
  userId: string, 
  activeSfdId: string, 
  params: LoanPaymentParams
): Promise<SyncResult> {
  if (!userId || !activeSfdId) {
    throw new Error('User or active SFD not set');
  }
  
  // Add a transaction record
  const { apiClient } = await import('@/utils/apiClient');
  await apiClient.callEdgeFunction('process-repayment', {
    userId: userId,
    sfdId: activeSfdId,
    loanId: params.loanId,
    amount: params.amount,
    paymentMethod: params.paymentMethod
  });
  
  return { 
    success: true,
    message: 'Payment processed successfully',
    updates: [{
      sfdId: activeSfdId,
      name: 'SFD Account',
      newBalance: 0 // The actual balance will be updated during sync
    }]
  };
}

/**
 * Processes a mobile money payment
 */
export async function processMobileMoneyPayment(
  userId: string,
  phoneNumber: string,
  amount: number,
  provider: string,
  isRepayment: boolean = false,
  loanId?: string
): Promise<SyncResult> {
  if (!userId) {
    throw new Error('Utilisateur non connecté');
  }
  
  try {
    const { apiClient } = await import('@/utils/apiClient');
    const payload: any = {
      userId,
      phoneNumber,
      amount,
      provider,
      isRepayment
    };
    
    if (isRepayment && loanId) {
      payload.loanId = loanId;
    }
    
    const result = await apiClient.callEdgeFunction('mobile-money-payment', payload);
    
    if (!result || !result.success) {
      throw new Error(result?.error || 'Échec du paiement mobile money');
    }
    
    return { 
      success: true,
      message: 'Paiement mobile money initié avec succès',
      updates: [{
        sfdId: 'mobile-money',
        name: 'Mobile Money',
        newBalance: 0 // Mobile money doesn't directly update SFD balance
      }]
    };
  } catch (error) {
    console.error('Failed to process mobile money payment:', error);
    throw new Error('Échec du paiement mobile money');
  }
}
