
import { supabase } from '@/integrations/supabase/client';
import { CreateLoanInput, Loan } from '@/types/sfdClients';

/**
 * Creates a new loan
 */
export const createLoan = async (loanData: CreateLoanInput): Promise<Loan> => {
  try {
    const response = await supabase.functions.invoke('loans-api/create', {
      method: 'POST',
      body: {
        clientId: loanData.client_id,
        sfdId: loanData.sfd_id,
        amount: loanData.amount,
        durationMonths: loanData.duration_months,
        interestRate: loanData.interest_rate,
        purpose: loanData.purpose,
        subsidyAmount: loanData.subsidy_amount,
        subsidyRate: loanData.subsidy_rate
      }
    });

    if (response.error || !response.data.success) {
      throw new Error(response.error || response.data.error || 'Failed to create loan');
    }

    return response.data.loan as Loan;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

/**
 * Approves a loan application
 */
export const approveLoan = async (loanId: string, approverId: string): Promise<Loan> => {
  try {
    const response = await supabase.functions.invoke('loans-api/approve', {
      method: 'POST',
      body: { loanId, approvedBy: approverId }
    });

    if (response.error || !response.data.success) {
      throw new Error(response.error || response.data.error || 'Failed to approve loan');
    }

    return response.data.loan as Loan;
  } catch (error) {
    console.error('Error approving loan:', error);
    throw error;
  }
};

/**
 * Rejects a loan application
 */
export const rejectLoan = async (loanId: string, rejecterId: string, reason?: string): Promise<Loan> => {
  try {
    const response = await supabase.functions.invoke('loans-api/reject', {
      method: 'POST',
      body: { loanId, rejectedBy: rejecterId, reason }
    });

    if (response.error || !response.data.success) {
      throw new Error(response.error || response.data.error || 'Failed to reject loan');
    }

    return response.data.loan as Loan;
  } catch (error) {
    console.error('Error rejecting loan:', error);
    throw error;
  }
};

/**
 * Disburses an approved loan
 */
export const disburseLoan = async (loanId: string, disburserId: string, method?: string): Promise<Loan> => {
  try {
    const response = await supabase.functions.invoke('loans-api/disburse', {
      method: 'POST',
      body: { loanId, disbursedBy: disburserId, method }
    });

    if (response.error || !response.data.success) {
      throw new Error(response.error || response.data.error || 'Failed to disburse loan');
    }

    return response.data.loan as Loan;
  } catch (error) {
    console.error('Error disbursing loan:', error);
    throw error;
  }
};

/**
 * Records a payment for a loan
 */
export const recordLoanPayment = async (
  loanId: string, 
  amount: number, 
  paymentMethod: string, 
  recordedBy?: string
) => {
  try {
    const response = await supabase.functions.invoke('loans-api/payment', {
      method: 'POST',
      body: { 
        loanId, 
        amount, 
        paymentMethod,
        reference: `PAY-${Date.now()}-${recordedBy?.substring(0, 8) || ''}`
      }
    });

    if (response.error || !response.data.success) {
      throw new Error(response.error || response.data.error || 'Failed to record payment');
    }

    return response.data.payment;
  } catch (error) {
    console.error('Error recording loan payment:', error);
    throw error;
  }
};

/**
 * Sends a payment reminder to a client
 */
export const sendPaymentReminder = async (loanId: string): Promise<boolean> => {
  try {
    const response = await supabase.functions.invoke('payment-reminders', {
      method: 'POST',
      body: { loanIds: [loanId], forceRemind: true }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};
