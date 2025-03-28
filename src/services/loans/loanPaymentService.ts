
import { supabase } from "@/integrations/supabase/client";
import { LoanPayment } from "@/types/sfdClients";

// Payment related operations
export const loanPaymentService = {
  // Record a loan payment
  async recordLoanPayment(loanId: string, amount: number, paymentMethod: string, recordedBy: string) {
    try {
      // Create the payment record
      const { data: paymentData, error: paymentError } = await supabase
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
      
      // Update the loan to reflect the payment
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: new Date().toISOString(),
          next_payment_date: getNextPaymentDate(30) // Set next payment 30 days from now
        })
        .eq('id', loanId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add loan payment activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: loanId,
          activity_type: 'payment_recorded',
          description: `Paiement de ${amount} FCFA enregistré`,
          performed_by: recordedBy
        });
        
      // Trigger notification webhook
      await supabase.functions.invoke('loan-status-webhooks', {
        body: {
          loanId,
          status: 'active',
          event: 'payment_received'
        }
      });
        
      return paymentData as unknown as LoanPayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },
  
  // Get loan payments
  async getLoanPayments(loanId: string) {
    try {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data as unknown as LoanPayment[];
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      return [];
    }
  }
};

// Helper function to calculate next payment date
function getNextPaymentDate(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
