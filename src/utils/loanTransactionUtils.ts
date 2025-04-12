
import sfdApiClient from './api/sfdApiClient';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/services/transactionService';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

/**
 * Approves a loan with atomic transaction guarantees
 * @param loanId The ID of the loan to approve
 * @param clientId The client receiving the loan
 * @param amount The loan amount
 * @param sfdId The SFD ID
 * @param approvedBy The ID of the user approving the loan
 */
export async function approveLoanWithTransaction(
  loanId: string,
  clientId: string,
  amount: number,
  sfdId: string,
  approvedBy: string
) {
  try {
    // Use the transaction method for atomic operations
    const result = await sfdApiClient.transaction([
      // 1. Update the loan status to approved
      {
        method: 'PUT',
        url: `/loans/${loanId}`,
        data: {
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        }
      },
      // 2. Update the SFD account balance
      {
        method: 'PUT',
        url: `/accounts/operation`,
        data: {
          amount: -amount, // Decrease SFD account balance
          transaction_type: 'loan_approval'
        }
      },
      // 3. Record a loan activity
      {
        method: 'POST',
        url: `/loan-activities`,
        data: {
          loan_id: loanId,
          activity_type: 'approval',
          performed_by: approvedBy,
          description: `Loan of ${amount} FCFA approved`
        }
      }
    ]);

    if (result.success) {
      // Log successful loan approval
      await logAuditEvent({
        action: "loan_approval",
        category: AuditLogCategory.LOAN_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: approvedBy,
        details: { 
          loan_id: loanId, 
          client_id: clientId,
          sfd_id: sfdId, 
          amount 
        }
      });
      
      return { success: true, data: result.results };
    } else {
      throw new Error(result.error || 'Transaction failed');
    }
  } catch (error) {
    console.error('Loan approval transaction failed:', error);
    
    // Log failure
    await logAuditEvent({
      action: "loan_approval",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.ERROR,
      status: 'failure',
      user_id: approvedBy,
      error_message: error.message,
      details: { 
        loan_id: loanId, 
        client_id: clientId, 
        sfd_id: sfdId,
        amount 
      }
    });
    
    return { 
      success: false, 
      error: error.message || 'Loan approval failed'
    };
  }
}

/**
 * Disburses a loan with atomic transaction guarantees
 * @param loanId The ID of the loan to disburse
 * @param clientId The client receiving the loan
 * @param amount The loan amount
 * @param sfdId The SFD ID
 * @param disbursedBy The ID of the user disbursing the loan
 */
export async function disburseLoanWithTransaction(
  loanId: string,
  clientId: string,
  amount: number,
  sfdId: string,
  disbursedBy: string
) {
  try {
    // Use the transaction method for atomic operations
    const result = await sfdApiClient.transaction([
      // 1. Update the loan status to active and set disbursement date
      {
        method: 'PUT',
        url: `/loans/${loanId}`,
        data: {
          status: 'active',
          disbursed_at: new Date().toISOString(),
          // Calculate next payment date (e.g., 30 days from now)
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      // 2. Create a transaction record for the client account
      {
        method: 'POST',
        url: `/transactions`,
        data: {
          user_id: clientId,
          sfd_id: sfdId,
          amount: amount,
          type: 'loan_disbursement',
          name: 'Décaissement de prêt',
          description: `Décaissement du prêt ${loanId}`,
          status: 'success'
        }
      },
      // 3. Record the loan activity
      {
        method: 'POST',
        url: `/loan-activities`,
        data: {
          loan_id: loanId,
          activity_type: 'disbursement',
          performed_by: disbursedBy,
          description: `Loan of ${amount} FCFA disbursed to client account`
        }
      }
    ]);

    if (result.success) {
      // Log successful loan disbursement
      await logAuditEvent({
        action: "loan_disbursement",
        category: AuditLogCategory.LOAN_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: disbursedBy,
        details: { 
          loan_id: loanId, 
          client_id: clientId,
          sfd_id: sfdId, 
          amount 
        }
      });
      
      return { success: true, data: result.results };
    } else {
      throw new Error(result.error || 'Transaction failed');
    }
  } catch (error) {
    console.error('Loan disbursement transaction failed:', error);
    
    // Log failure
    await logAuditEvent({
      action: "loan_disbursement",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.ERROR,
      status: 'failure',
      user_id: disbursedBy,
      error_message: error.message,
      details: { 
        loan_id: loanId, 
        client_id: clientId, 
        sfd_id: sfdId,
        amount 
      }
    });
    
    return { 
      success: false, 
      error: error.message || 'Loan disbursement failed'
    };
  }
}

/**
 * Processes a loan repayment with atomic transaction guarantees
 * @param loanId The ID of the loan being repaid
 * @param clientId The client making the payment
 * @param amount The payment amount
 * @param sfdId The SFD ID
 * @param paymentMethod The payment method
 * @param processedBy The ID of the user processing the payment
 */
export async function processLoanRepaymentWithTransaction(
  loanId: string,
  clientId: string,
  amount: number,
  sfdId: string,
  paymentMethod: string,
  processedBy: string
) {
  try {
    // First, get the loan details to determine remaining amount
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('amount, status, remaining_amount')
      .eq('id', loanId)
      .single();
      
    if (loanError || !loan) {
      throw new Error('Failed to retrieve loan details');
    }
    
    // Calculate new remaining amount and determine if loan is paid off
    const currentRemainingAmount = loan.remaining_amount || loan.amount;
    const newRemainingAmount = Math.max(0, currentRemainingAmount - amount);
    const newStatus = newRemainingAmount === 0 ? 'paid' : loan.status;
    
    // Use the transaction method for atomic operations
    const result = await sfdApiClient.transaction([
      // 1. Update the loan with payment information
      {
        method: 'PUT',
        url: `/loans/${loanId}`,
        data: {
          remaining_amount: newRemainingAmount,
          status: newStatus,
          last_payment_date: new Date().toISOString()
        }
      },
      // 2. Create a payment record
      {
        method: 'POST',
        url: `/loan-payments`,
        data: {
          loan_id: loanId,
          amount: amount,
          payment_method: paymentMethod,
          status: 'completed'
        }
      },
      // 3. Create a transaction record
      {
        method: 'POST',
        url: `/transactions`,
        data: {
          user_id: clientId,
          sfd_id: sfdId,
          amount: -amount, // Negative for outgoing funds
          type: 'loan_repayment',
          name: 'Remboursement de prêt',
          description: `Remboursement de ${amount} FCFA pour le prêt ${loanId.substring(0, 8)}`,
          payment_method: paymentMethod,
          reference_id: loanId,
          status: 'success'
        }
      },
      // 4. Update SFD repayment account
      {
        method: 'PUT',
        url: `/accounts/remboursement`,
        data: {
          amount: amount, // Increase SFD repayment account
          transaction_type: 'loan_repayment'
        }
      }
    ]);

    if (result.success) {
      // Log successful repayment
      await logAuditEvent({
        action: "loan_repayment",
        category: AuditLogCategory.LOAN_OPERATIONS,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        user_id: processedBy,
        details: { 
          loan_id: loanId, 
          client_id: clientId,
          sfd_id: sfdId, 
          amount,
          payment_method: paymentMethod,
          remaining_amount: newRemainingAmount,
          is_paid_off: newRemainingAmount === 0
        }
      });
      
      return { 
        success: true, 
        data: { 
          ...result.results,
          remainingAmount: newRemainingAmount,
          isPaidOff: newRemainingAmount === 0 
        } 
      };
    } else {
      throw new Error(result.error || 'Transaction failed');
    }
  } catch (error) {
    console.error('Loan repayment transaction failed:', error);
    
    // Log failure
    await logAuditEvent({
      action: "loan_repayment",
      category: AuditLogCategory.LOAN_OPERATIONS,
      severity: AuditLogSeverity.ERROR,
      status: 'failure',
      user_id: processedBy,
      error_message: error.message,
      details: { 
        loan_id: loanId, 
        client_id: clientId, 
        sfd_id: sfdId,
        amount 
      }
    });
    
    return { 
      success: false, 
      error: error.message || 'Loan repayment failed'
    };
  }
}
