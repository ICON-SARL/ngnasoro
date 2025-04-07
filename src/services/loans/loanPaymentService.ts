
import { supabase } from "@/integrations/supabase/client";
import { LoanPayment } from "@/types/sfdClients";
import { createTransactionManager } from "@/services/transactions/transactionManager";

// Loan payment operations
export const loanPaymentService = {
  // Record a payment for a loan
  async recordLoanPayment(loanId: string, amount: number, paymentMethod: string, recordedBy?: string) {
    try {
      // First, get the loan details to check SFD ID and client ID
      const { data: loan, error: loanError } = await supabase
        .from('sfd_loans')
        .select('client_id, sfd_id, status')
        .eq('id', loanId)
        .single();
        
      if (loanError) throw loanError;
      
      if (loan.status !== 'active') {
        throw new Error('Cannot make payment on a non-active loan');
      }
      
      // Create a payment record
      const { data: payment, error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loanId,
          amount: amount,
          payment_method: paymentMethod,
          status: 'completed'
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // Also create a transaction record using the transaction manager
      if (loan.client_id && loan.sfd_id) {
        const transactionManager = createTransactionManager(loan.client_id, loan.sfd_id);
        await transactionManager.makeLoanRepayment(
          loanId, 
          amount, 
          'Remboursement de prêt', 
          paymentMethod
        );
      }
      
      // Add loan payment activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_recorded',
          description: `Paiement de ${amount} FCFA enregistré`,
          performed_by: recordedBy
        });
        
      // Check if this is the last payment
      await updateLoanStatusAfterPayment(loanId);
      
      // Send notification via webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'payment_received',
          paymentId: payment.id
        }
      });
        
      return payment as LoanPayment;
    } catch (error) {
      console.error('Error recording loan payment:', error);
      throw error;
    }
  },
  
  // Get payment history for a loan
  async getLoanPayments(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      
      return data as LoanPayment[];
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      return [];
    }
  }
};

// Helper function to update loan status based on payments
async function updateLoanStatusAfterPayment(loanId: string) {
  try {
    // Get the loan details
    const { data: loan, error: loanError } = await supabase
      .from('sfd_loans')
      .select('amount, duration_months')
      .eq('id', loanId)
      .single();
      
    if (loanError) throw loanError;
    
    // Get the total payments made
    const { data: payments, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('amount')
      .eq('loan_id', loanId)
      .eq('status', 'completed');
      
    if (paymentsError) throw paymentsError;
    
    // Calculate total payments
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate the expected total to be paid (principal + interest)
    const monthlyRate = loan.amount * (1 + (loan.duration_months * 0.01));
    const expectedTotal = monthlyRate * loan.duration_months;
    
    // If total paid is >= expected total, mark loan as completed
    if (totalPaid >= expectedTotal) {
      await supabase
        .from('sfd_loans')
        .update({
          status: 'completed',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', loanId);
        
      // Add loan completion activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'loan_completed',
          description: 'Prêt entièrement remboursé'
        });
    } else {
      // Just update the last payment date
      await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: new Date().toISOString(),
          next_payment_date: getNextPaymentDate()
        })
        .eq('id', loanId);
    }
  } catch (error) {
    console.error('Error updating loan status after payment:', error);
  }
}

// Helper function to calculate next payment date
function getNextPaymentDate(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
